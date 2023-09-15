# Links

https://cloud.mongodb.com
https://fullstackopen.com/osa3/tietojen_tallettaminen_mongo_db_tietokantaan#mongo-db

# Nuotit google drivesta

Tehdään joku ihme apps script, ja kutsutaan "ihan tosta vaan"
rekursiivisesti google driven rajapintaa, lähtien juurikansion id:stä

Esim. Ahjolan pelimannien arkisto

https://script.google.com/u/0/home/projects/1PFZGY6jm_ktiWrvhxuplvzfe1WRlymvTELr7ytcLSQNGUVBfRzf8qkmM/edit

## PDF selaimeen siten, että toimii swipe

Pelkkä linkki ei toimi, koska tässä tulee googlen javascript pdf viewer
https://drive.google.com/file/d/1X5Flm-tFo4jVHu8u4p49CkqeEqqxzaiW/view?usp=drivesdk

1. lataa serverlessillä pdf,

   https://developers.google.com/drive/api/quickstart/nodejs

   https://github.com/orgs/vercel/discussions/219

   - suojaa tämä
   - mikä google drive api tiedonsiirto-quota on?

2. näytä blob react-pdf-viewerillä
   https://react-pdf-viewer.dev/docs/getting-started/

   https://stackoverflow.com/questions/73961579/react-app-pdf-retrieved-from-server-in-object-visible-in-mozilla-but-not-i

3. lisää next/previous ja kytke niihin swipe
   https://react-pdf-viewer.dev/examples/slide-presentation/

## Toinen tapa saada PDF:t selaimeen

1. lataa google drivestä omalle vpn:lle, johon cors asetuksissa tai apikey,
   johon sallittu lähde

   https://developers.google.com/drive/api/quickstart/nodejs

2. näytä blob PDF kuten edellä tai https://www.geeksforgeeks.org/how-to-display-a-pdf-as-an-image-in-react-app-using-url/bg

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
