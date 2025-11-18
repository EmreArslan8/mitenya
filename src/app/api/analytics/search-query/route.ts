/*
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';
const SPREADSHEET_ID = '1E7007jCQWj2joEMy8NODuahP7KaJ8DW_PloMK7yNBCw';
const RANGE = 'Sayfa1!A1:B';

const serviceAccount = {
  type: 'service_account',
  project_id: 'bringist',
  private_key_id: 'a43a4f236327f50d754fd40e27a4180b05431531',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8lakaRU4QJS7D\n5i2tlUb79dXC8L8tdtGDPK4IuXsP5o7Rd4rv5+OItaYM2khBGsHhhOQTYXfalGCS\nG7tB5+rxH/lI0yt0jnfIN32PDFj0M3vJwd56vmdamI4bZVjlsJ28k1rarAt6IrVw\njropJ7mhAJUCw0hMUi0/UKSRJtl8JAAvMj7vGES9LGT0X0kUGNz3xaSxqEYS0Fdh\nn0FoeQUAzb5ftRgnusgN77AoWmO0eYPeEbYgxYxke4XXroGjpVdj0eCdBxEtRVIm\no2va15SzIt/FYUKXK7fQqVLxvSLwilXfouG8x0M7gQc/fAcTGxVHcUHc1zyH/dvh\nPEG2GxR/AgMBAAECggEAED4UdLNknm/FaZDPfSeu5Haimz0T1woCNsgPXHSbpjcl\nmxVgikcyFsBzQjoh7QTHKPH1y7siXb++QMQfF1viC81emCiJkdFpFn28OvASUH4h\nFE1PwmMLd22AsXIqLoyzf6sLytFbCU4oZT7PYLB2N+kn7GplAlKcAqii2lZuEIrK\nUVnYjiIQH8lQYjGbJhzcfy+beV1Z/haLPMddblMTOiWJ4RI7JOCYUCIGwFfyY8gb\n/H/Cj+vUj1jWuNfMiAy/QWNG139ih5mqoKBsTz2BOqqZFovjO/rXmOulzkGsohUx\n8je/JmjG0f8IQcZYhwnER6dxc/gLlpVfepk2vPSFoQKBgQD4DPlG+fqS981c/Jdo\nahkYroEqM1A3cneYtdc0C06pnGGqFLqgcb3qNeRUU8KWJE2dneYwCkPDT7lhjHfp\nA1f+BWx3v1VHuhdMaQE0mleGGf9IhGfQQmdv3Y4jEpSolGQ9G3mqp9qg9YhTU/4W\nz34H25x6cnLUhnLZ2qc3Az4CDwKBgQDCoNKhCzYQh4tOYNGoh5pUYT7XyT0n10NX\nbspfs/LD8HARtRKIAYDfJ0LEbNIYAkshiSw6f7Cvmk4beTRyl0Ol2JboGcbrkwI8\nv/QUvpTFavNBbh61pnG0BMYSWeg6CssNvF148grGMbbkoPe3StRVHUrNDEMQi7xQ\nHa5MGWd2kQKBgE6DjMOyjGXImfA844/hRWBSm//HjjR+vuxPYnbOvW9iWGeFeC0g\n04Q22rb2bDkp9IdXW20JUrmXmo4N8EaJEGkPPm4I2e2CMa217vO/hsSjpfJGNrXs\nzuDRuBPR5cwWbEQLVk92IfWgwi3eACcoNjQ2hyka4M30YJYkZ5k6JX5xAoGBAJ2y\nSxebiuHXwYLvJdFkliJabN3Qu1GFtJWqOiVTG5exQEzIp0w106J8IDghaBV1/kQc\n7g40Gggegbz29w0GDRTaqmNDR47mnYB1k6IfTVGsN49DV3SdeTGAULDb0jL9PctS\nXXY6v4oZC/SxjCUiZ2rTgiEkF07Xuew8MFaOmutRAoGBAKuIs5qaEeXNnejkf2gh\nEDPey85hEK4zFS0/XCq9mchv76UggZ3GpyBd+YeAHparXaZD0PEXAWPZbC74iLSH\nZJA7y1udabqYl6VluZIG+VgnX2O3IosTFTrnckEWUeZKT5awismj4qw1DVb9UZWq\nS2Q+Mgt6MMp2X5Rm8Vr60SBI\n-----END PRIVATE KEY-----\n',
  client_email: 'sheets-account@bringist.iam.gserviceaccount.com',
  client_id: '115230384921831803369',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/sheets-account%40bringist.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

async function appendData(values: any[]) {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  if (!isProduction)
    return NextResponse.json(
      { message: 'Rejected: Not in production environment.' },
      { status: 412 }
    );

  try {
    const epochTimestamp = Math.floor(Date.now() / 1000);
    await appendData([[query, epochTimestamp]]);
    return NextResponse.json({ message: 'Success.' }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

*/
