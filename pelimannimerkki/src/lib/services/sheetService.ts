import Papa from 'papaparse';

export const SHEET_ID = '1gyEze4GRZIsNwnO9UoCnb5oq6llJ9Nj8STkUKaY9qSo';
export const SHEET_GID = '1295352290';

const DATA_START_ROW = 1;
const DATA_END_ROW = 60;
const DATA_START_COL = 1;
const DATA_END_COL = 10;

export async function fetchSheetData(): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch sheet data');
  }
  
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      complete: (results) => {
        const allData = results.data as string[][];
        const newData = allData
          .slice(DATA_START_ROW, DATA_END_ROW)
          .map(row => row.slice(DATA_START_COL, DATA_END_COL));
        resolve(newData);
      },
      error: (err: any) => {
        reject(new Error(`CSV parsing failed: ${err.message}`));
      }
    });
  });
}

