import express, { Request, Response } from "express";
import { readFileSync, writeFile, existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import * as fsPromises from "fs/promises";
import cors from "cors";

const port = 3002;

const app = express();
app.use(express.json());
app.use(
  cors({
    methods: ["GET", "POST", "OPTIONS", "HEAD"],
    exposedHeaders: ["Access-Control-Allow-Methods"],
  })
);

app.get("/api", (req: any, res: any) => {
  res.send("API v1.0");
});

app.put("/api", (req: any, res: any) => {
  res.send("No no no");
});

app.post("/api/company", (req: Request, res: Response) => {
  const { name, category, address } = req.body;

  console.log(req.body);

  if (!name || !category || !address) res.status(400).send("Bad request");

  const data = readFileSync("./src/companies.json", "utf-8");
  const companies = JSON.parse(data);

  companies.push({ id: uuidv4(), name, category, address });

  try {
    writeFile("./src/companies.json", JSON.stringify(companies), () => {});

    res.status(201).send("Company created");
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.post("/api/offer", (req: Request, res: Response) => {
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
    if (!value) res.status(400).send("Bad request");
  });

  const data = readFileSync("./src/offers.json", "utf-8");
  const offers = JSON.parse(data);

  offers.push({ id: uuidv4(), ...req.body });

  try {
    writeFile("./src/offers.json", JSON.stringify(offers), () => {});

    res.status(201).send("Offer created");
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/api/offers", (req: any, res: any) => {
  try {
    const dataOffers = readFileSync("./src/offers.json", "utf-8");
    const dataCompanies = readFileSync("./src/companies.json", "utf-8");
    let offers = JSON.parse(dataOffers);
    let comapanies = JSON.parse(dataCompanies);

    offers = offers.map((offer: any) => {
      const company = comapanies.find(
        (company: any) => company.id === offer.company
      );
      return { ...offer, company };
    });

    console.log(offers);

    res.send(offers);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/api/candidates", (req: any, res: any) => {
  try {
    const dataCandidates = readFileSync("./src/candidates.json", "utf-8");
    let candidates = JSON.parse(dataCandidates);

    res.send(candidates);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/api/:offer/candidates", (req: any, res: any) => {
  const { offer } = req.params;

  try {
    const dataOffers = readFileSync("./src/offers.json", "utf-8");
    let offers = JSON.parse(dataOffers);

    let offerToApply = offers.find((offerItem: any) => {
      return offerItem.id === offer;
    });

    if (!offerToApply) {
      res.status(404).send("Offer not found");
    }

    const dataCandidates = readFileSync("./src/candidates.json", "utf-8");
    let candidates = JSON.parse(dataCandidates);

    console.log(candidates);

    candidates = candidates.filter(
      (candidate: any) => candidate.offer == offer
    );
    console.log(offer);

    const dataCompanies = readFileSync("./src/companies.json", "utf-8");

    let comapanies = JSON.parse(dataCompanies);

    const company = comapanies.find(
      (company: any) => company.id === offerToApply.company
    );
    offerToApply = { ...offerToApply, company };

    res.send({ offer: offerToApply, candidates });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.post("/api/:offer/candidate", (req: any, res: any) => {
  const { offer } = req.params;

  const acceptedKeys = ["fullname", "about", "phone", "email"];

  Object.keys(req.body).forEach((key) => {
    if (!acceptedKeys.includes(key)) {
      delete req.body[key];
    }
  });

  Object.values(req.body).forEach((value) => {
    if (!value) res.status(400).send("Bad request");
  });

  const dataOffers = readFileSync("./src/offers.json", "utf-8");
  let offers = JSON.parse(dataOffers);

  const offerToApply = offers.find((offerItem: any) => {
    return offerItem.id === offer;
  });

  if (!offerToApply) {
    res.status(404).send("Offer not found");
  }

  const data = readFileSync("./src/candidates.json", "utf-8");
  const candidates = JSON.parse(data);

  candidates.push({ id: uuidv4(), ...req.body, offer });

  try {
    writeFile("./src/candidates.json", JSON.stringify(candidates), () => {});

    res.status(201).send("Candidate created");
  } catch (error) {
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
    if (existsSync(`./src/${filename}`)) {
      const fileStats = await fsPromises.stat(`./src/${filename}`);
      Object.entries(fileStats).forEach(([key, value]) => res.set(key, value));
      res.send();
    }

    res.status(404);
  } catch (err) {
    res.status(500);
  }
});

app.listen(port);
