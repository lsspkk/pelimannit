# Links

https://cloud.mongodb.com
https://fullstackopen.com/osa3/tietojen_tallettaminen_mongo_db_tietokantaan#mongo-db

# Ylläpitoa

Hae/Poista: Muokkaa tiedostoa scripts/manage.ts, ja aja se

      npx ts-node scripts/manage.ts

Luo/testaa arkiston käyttäjän tai ylläpitäjän tai salasana

     node scripts/makepassword.js



## Nuotit google drivesta

Tehty google apps script, ja kutsutaan "ihan tosta vaan"
rekursiivisesti google driven rajapintaa, lähtien juurikansion id:stä

Esim. Ahjolan pelimannien arkisto

https://script.google.com/u/0/home/projects/1PFZGY6jm_ktiWrvhxuplvzfe1WRlymvTELr7ytcLSQNGUVBfRzf8qkmM/edit

# PDF selaimeen siten, että toimii swipe

## Iframe jonka sisällä googlen sivun aukaisu

Valittu tapa

Toimii, mutta tehty swipe-alue ruudun alareunaan, jotta pystyy käyttämään hiirtä myös pdf:n katseluun. Ei onnistu sivunvaihdon automatisointi bluetooth tms. laitteella.



## Google drive api, ja blobbailu

Toteutettu, mutta hidas ainakin, kun backend on vercel serverless.

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

# lokaalit tiedostot

Tätä käytetty nopeuttamaan nuottien latausta. 
Toimii android-puhelimellakin, mutta puhelimeen hankala ladata
tiedostot yhteen hakemistoon, josta ne valittaisiin. 
Selaimella toimii kauniisti.

Parempii ratkaisu olisi ladata pdf:t tai niistä tehdyt kuvatiedostot 
omalle serverille backendiksi, ja käyttää aivan normaalia selaimen
välimuistia näyttämisen nopeuttamiseksi. 



Secure Context localhostiin
https://github.com/FiloSottile/mkcert
https://www.npmjs.com/package/local-ssl-proxy

npx local-ssl-proxy --source 3001 --target 3000 --key localhost-key.pem --cert localhost.pem
https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker

-- ei firefoxissa :(

https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory

-- ei firefox for androidissa, mutta on androidin chromessa.
olis riittävän hyvä

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
