import fs from "fs";

const readFile = (filename: string): number[][] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n");

  const reports: number[][] = [];
  for (const line of lines) {
    const values = line.split(" ");
    if (values.length === 1) continue;
    const report = values.map((value) => parseInt(value));
    reports.push(report);
  }

  return reports;
};

const checkSafety = (report: number[]): boolean => {
  let sign = 0;
  for (let i = 0; i < report.length - 1; ++i) {
    const difference = report[i] - report[i + 1];
    const differenceSign = Math.sign(difference);

    if (difference === 0) {
      return false;
    }

    if (Math.abs(difference) > 3) {
      return false;
    }

    if (sign === 0) {
      sign = differenceSign;
    } else if (sign !== differenceSign) {
      return false;
    }
  }

  return true;
};

const main = () => {
  const data = readFile(process.argv[2] ?? "test.txt");
  const safeReports = data.filter(checkSafety);
  console.log("result is:", safeReports.length);
};

main();
