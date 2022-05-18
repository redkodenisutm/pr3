import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3003/api",
  timeout: 1000,
  headers: { "Content-Type": "application/json" },
});

const httpClient = async () => {
  let res = await instance.get("/offers");
  const offers = res.data;
  console.log("Offers:", offers);

  res = await instance.get("/candidates");

  console.log({ candidates: res.data });

  const myResume = {
    fullname: "Redko Denis",
    about: "I am a frontend developer",
    phone: "123456789",
    email: "redko.denis@isa.utm.md",
  };

  const strangerResume = {
    fullname: "Boris Nemtov",
    about: "I am a politician",
    phone: "+4 0000000000",
    email: "boris.nemtov@ru",
  };

  for (const offer of offers) {
    await instance.post(`${offer.id}/candidate`, myResume);
    await instance.post(`${offer.id}/candidate`, strangerResume);
  }

  res = await instance.get("/candidates");

  const regex = new RegExp(
    /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    "g"
  );
  let candidatesStudentsAtUtm = res.data.filter((candidate: any) =>
    regex.test(candidate.email)
  );
  console.log({ candidates: candidatesStudentsAtUtm });

  res = await instance.options("/options");
  console.log("Server options:", res.headers);

  const jsons = ["offers", "companies", "bin", "candidates"];
  res = await instance.options("/options");

  for (const json of jsons) {
    try {
      const res = await instance.head(`/head/${json}.json`);
      console.log(`${json}.json:`, res.headers);
    } catch (error) {
      console.log(`${json}.json:`, "probably file not found");
    }
  }
};

httpClient();
