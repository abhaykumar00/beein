const axios = require("axios");
const fs = require("fs").promises;

let counting = 0; // Initialize counting

const fetchData = async (id) => {
  console.log(`Fetching data for id: ${id.id}`);
  const url = `https://evyatra.beeindia.gov.in/bee-ev-backend/getPCSdetailsbystationid`;
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8,fr;q=0.7",
    Connection: "keep-alive",
    Origin: "https://evyatra.beeindia.gov.in",
    Referer: "https://evyatra.beeindia.gov.in/",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36 Edg/125.0.0.0",
  };
  const requestBody = {
    stationId: id.id,
  };
  try {
    const response = await axios.post(url, requestBody, { headers });
    
    let existingData = [];
    try {
      const data = await fs.readFile(`11.json`, "utf-8");
      existingData = JSON.parse(data);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    existingData.push(response.data.value);

    await fs.writeFile(`11.json`, JSON.stringify(existingData, null, 2));
    console.log(`Data saved for id: ${id.id}`);
  } catch (error) {
    console.error(`Error fetching data for id ${id.id}:`, error.message);
    throw error;
  }
};

const run = async (id) => {
  try {
    await fetchData(id);
  } catch (error) {
    console.error(`Error in run for id ${id.id}:`, error.message);
  }
};

const INTERVAL = 0;
const REQUESTS = 76;
const MAX_ERRORS = 2;

const start = async () => {
  let errorCount = 0;
  try {
    const values = JSON.parse(await fs.readFile(`a.json`, "utf-8"));
    for (let i = 0; i < values.length; i++) {
      if (errorCount >= MAX_ERRORS) {
        console.error(
          "Maximum consecutive errors reached. Stopping execution."
        );
        return;
      }

      try {
        await run(values[i]);
        errorCount = 0; // Reset error count on successful request
        await new Promise((resolve) => setTimeout(resolve, INTERVAL));
      } catch (error) {
        errorCount++;
        console.error(`Consecutive errors: ${errorCount}`);
      }
    }
    counting++; // Increment counting after processing all values
  } catch (error) {
    console.error("Error reading values from a.json:", error.message);
  }
};
const starting = async () => {
  const values = JSON.parse(await fs.readFile(`a.json`, "utf-8"));
  console.log(values.length);
};
start();
