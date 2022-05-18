"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const fsPromises = __importStar(require("fs/promises"));
const cors_1 = __importDefault(require("cors"));
const port = 3002;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    methods: ["GET", "POST", "OPTIONS", "HEAD"],
    exposedHeaders: ["Access-Control-Allow-Methods"],
}));
app.get("/api", (req, res) => {
    res.send("API v1.0");
});
app.put("/api", (req, res) => {
    res.send("No no no");
});
app.post("/api/company", (req, res) => {
    const { name, category, address } = req.body;
    console.log(req.body);
    if (!name || !category || !address)
        res.status(400).send("Bad request");
    const data = (0, fs_1.readFileSync)("./src/companies.json", "utf-8");
    const companies = JSON.parse(data);
    companies.push({ id: (0, uuid_1.v4)(), name, category, address });
    try {
        (0, fs_1.writeFile)("./src/companies.json", JSON.stringify(companies), () => { });
        res.status(201).send("Company created");
    }
    catch (error) {
        res.status(500).send("Server error");
    }
});
app.post("/api/offer", (req, res) => {
    const acceptedKeys = [
        "company",
        "role",
        "published",
        "location",
        "requirements",
        "salary",
    ];
    Object.keys(req.body).forEach((key) => {
        if (!acceptedKeys.includes(key)) {
            delete req.body[key];
        }
    });
    Object.values(req.body).forEach((value) => {
        if (!value)
            res.status(400).send("Bad request");
    });
    const data = (0, fs_1.readFileSync)("./src/offers.json", "utf-8");
    const offers = JSON.parse(data);
    offers.push({ id: (0, uuid_1.v4)(), ...req.body });
    try {
        (0, fs_1.writeFile)("./src/offers.json", JSON.stringify(offers), () => { });
        res.status(201).send("Offer created");
    }
    catch (error) {
        res.status(500).send("Server error");
    }
});
app.get("/api/offers", (req, res) => {
    try {
        const dataOffers = (0, fs_1.readFileSync)("./src/offers.json", "utf-8");
        const dataCompanies = (0, fs_1.readFileSync)("./src/companies.json", "utf-8");
        let offers = JSON.parse(dataOffers);
        let comapanies = JSON.parse(dataCompanies);
        offers = offers.map((offer) => {
            const company = comapanies.find((company) => company.id === offer.company);
            return { ...offer, company };
        });
        console.log(offers);
        res.send(offers);
    }
    catch (error) {
        res.status(500).send("Server error");
    }
});
app.get("/api/candidates", (req, res) => {
    try {
        const dataCandidates = (0, fs_1.readFileSync)("./src/candidates.json", "utf-8");
        let candidates = JSON.parse(dataCandidates);
        res.send(candidates);
    }
    catch (error) {
        res.status(500).send("Server error");
    }
});
app.get("/api/:offer/candidates", (req, res) => {
    const { offer } = req.params;
    try {
        const dataOffers = (0, fs_1.readFileSync)("./src/offers.json", "utf-8");
        let offers = JSON.parse(dataOffers);
        let offerToApply = offers.find((offerItem) => {
            return offerItem.id === offer;
        });
        if (!offerToApply) {
            res.status(404).send("Offer not found");
        }
        const dataCandidates = (0, fs_1.readFileSync)("./src/candidates.json", "utf-8");
        let candidates = JSON.parse(dataCandidates);
        console.log(candidates);
        candidates = candidates.filter((candidate) => candidate.offer == offer);
        console.log(offer);
        const dataCompanies = (0, fs_1.readFileSync)("./src/companies.json", "utf-8");
        let comapanies = JSON.parse(dataCompanies);
        const company = comapanies.find((company) => company.id === offerToApply.company);
        offerToApply = { ...offerToApply, company };
        res.send({ offer: offerToApply, candidates });
    }
    catch (error) {
        res.status(500).send("Server error");
    }
});
app.post("/api/:offer/candidate", (req, res) => {
    const { offer } = req.params;
    const acceptedKeys = ["fullname", "about", "phone", "email"];
    Object.keys(req.body).forEach((key) => {
        if (!acceptedKeys.includes(key)) {
            delete req.body[key];
        }
    });
    Object.values(req.body).forEach((value) => {
        if (!value)
            res.status(400).send("Bad request");
    });
    const dataOffers = (0, fs_1.readFileSync)("./src/offers.json", "utf-8");
    let offers = JSON.parse(dataOffers);
    const offerToApply = offers.find((offerItem) => {
        return offerItem.id === offer;
    });
    if (!offerToApply) {
        res.status(404).send("Offer not found");
    }
    const data = (0, fs_1.readFileSync)("./src/candidates.json", "utf-8");
    const candidates = JSON.parse(data);
    candidates.push({ id: (0, uuid_1.v4)(), ...req.body, offer });
    try {
        (0, fs_1.writeFile)("./src/candidates.json", JSON.stringify(candidates), () => { });
        res.status(201).send("Candidate created");
    }
    catch (error) {
        res.status(500).send("Server error");
    }
});
app.options("/api/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.send(200);
});
app.head("/api/head/:filename", async (req, res) => {
    const { filename } = req.params;
    try {
        if ((0, fs_1.existsSync)(`./src/${filename}`)) {
            const fileStats = await fsPromises.stat(`./src/${filename}`);
            Object.entries(fileStats).forEach(([key, value]) => res.set(key, value));
            res.send();
        }
        res.status(404);
    }
    catch (err) {
        res.status(500);
    }
});
app.listen(port);
