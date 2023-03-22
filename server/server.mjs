/**
 * Minimal crud rest api
 */

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import next from "next";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { readFileSync } from "fs";

// allow some optional timeout for the loading animations
const TIMEOUT = 0;

const IMAGES_FILE = join(dirname(fileURLToPath(import.meta.url)), "image.urls");
const DATABASE_FILE = join(dirname(fileURLToPath(import.meta.url)), "db.json");
const GUEST_LIST_SIZE = [100, 500, 1000];

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(DATABASE_FILE);
const db = new Low(adapter);

// Read data from JSON file, this will set db.data content
await db.read();

// If db.json doesn't exist, db.data will be null
if (!db.data) {
    console.log("Setting up some example events and guests");

    const images = readFileSync(IMAGES_FILE, "utf-8")
        .split("\n")
        .filter(Boolean);
    console.log(`${images.length} available images`);

    const sampleEvents = [];
    for (
        let eventIndex = 1;
        eventIndex <= GUEST_LIST_SIZE.length;
        eventIndex++
    ) {
        // 100 guests for first event, 200 for second, 300 for third, etc
        const guests = [];
        for (
            let guestIndex = 1;
            guestIndex <= GUEST_LIST_SIZE[eventIndex - 1];
            guestIndex++
        ) {
            guests.push({
                id: guestIndex,
                name: `Event #${eventIndex} Guest #${guestIndex}`,
                imageUrl: images[guestIndex % images.length],
                checkedIn: null,
            });
        }

        sampleEvents.push({
            id: eventIndex,
            name: `Event #${eventIndex}`,
            guests,
        });
    }

    db.data = sampleEvents;
    await db.write();
}

const events = db.data;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function server() {
    const server = express();
    server.use(cors());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use((req, res, next) => setTimeout(next, TIMEOUT));

    // catch the item operations and throw a 404 if the entity does not exist
    server.all("/api/ping", function (req, res) {
        res.status(200).send("pong");
    });

    server.all("/api/events", function (req, res) {
        res.status(200).send(
            events.map((event) => ({
                id: event.id,
                name: event.name,
                guestCount: event.guests.length,
            }))
        );
    });

    // catch the event operations and throw a 404 if the event does not exist
    server.all("/api/events/:id", function (req, res, next) {
        if (!events.find((event) => event.id === +req.params.id)) {
            res.status(404).send("Event not found");
        } else {
            next();
        }
    });

    server.route("/api/events/:id").get((req, res) => {
        res.status(200).json(
            events.find((event) => event.id === +req.params.id)
        );
    });

    server.route("/api/events/:id").post(async (req, res) => {
        if (!Array.isArray(req.body)) {
            res.status(400).send("expecting and array");
            return;
        }

        const event = events.find((event) => event.id === +req.params.id);

        if (!event) {
            res.status(404).send("Event not found");
            return;
        }

        req.body.forEach((guestId) => {
            const guest = event.guests.find((guest) => guest.id === guestId);

            if (guest) {
                guest.checkedIn = new Date().toISOString();
            }
        });

        await db.write();

        res.status(200).json(
            event.guests.filter((guest) => !guest.checkedIn).length
        );
    });

    server.get("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log("> Ready on http://localhost:3000");
    });
}

app.prepare()
    .then(server)
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });

// (function () {
//     let lines = [];
//     for (let image of document.getElementsByTagName("img")) {
//         if (image.src.startsWith("https://assets.in-cdn.net/image/120_120")) {
//             lines.push(image.src);
//         }
//     }
//     console.log(lines.length);
//     console.log(lines.join("\n"));
// })();
