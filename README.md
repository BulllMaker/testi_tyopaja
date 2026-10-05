# YhetPuheet-työtila

YhetPuheet Median asiakkaan hyväksyntätyötila. Tiimi tallentaa yhden PDF-paketin, jossa ovat kuukauden kaikkien videoiden käsikirjoitukset ja katselulinkit. Asiakas avaa paketin ja hyväksyy sen kokonaisuutena. Hyväksynnästä tallentuvat käyttäjä ja ajankohta.

Sovellus käyttää Sites-palvelun kirjautumista, D1-tietokantaa ja yksityistä R2-tiedostotallennusta. Paketti näkyy vain sitä vastaavan sähköpostiosoitteen käyttäjälle sekä työtilan ylläpitäjälle. Asiakkaalle on annettava pääsy yksityiseen Siteen erikseen ennen kuin hän voi kirjautua.

## Kehitys

Projektissa käytetään Vinext-aloituspohjaa. Riippuvuudet asennetaan komennolla `npm ci`. GitHubista kloonattua projektia varten kopioi `.openai/hosting.example.json` tiedostoksi `.openai/hosting.json` ennen rakennusta. Sen jälkeen sovellus käynnistyy komennolla `npm run dev` ja rakentuu komennolla `npm run build`. Tietokantamuutokset ovat `drizzle/`-hakemistossa. Tuotannon Sites-asetuksessa on lisäksi julkaisun tunniste, jota ei viedä julkiseen GitHub-repositorioon.

