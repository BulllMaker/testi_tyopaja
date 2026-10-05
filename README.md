# YhetPuheet-työtila

YhetPuheet Median asiakkaan hyväksyntätyötila. Tiimi tallentaa yhden PDF-paketin, jossa ovat kuukauden kaikkien videoiden käsikirjoitukset ja katselulinkit. Asiakas avaa paketin ja hyväksyy sen kokonaisuutena. Hyväksynnästä tallentuvat käyttäjä ja ajankohta.

Sovellus käyttää Sites-palvelun kirjautumista, D1-tietokantaa ja yksityistä R2-tiedostotallennusta. Paketti näkyy vain sitä vastaavan sähköpostiosoitteen käyttäjälle sekä työtilan ylläpitäjälle. Asiakkaalle on annettava pääsy yksityiseen Siteen erikseen ennen kuin hän voi kirjautua.

## Kehitys

Projektissa käytetään Vinext-aloituspohjaa. Riippuvuuksien asennuksen jälkeen sovellus käynnistyy komennolla `npm run dev` ja rakentuu komennolla `npm run build`. Tietokantamuutokset ovat `drizzle/`-hakemistossa. Tuotannon Sites-sidonnat ovat erillisessä `.openai/hosting.json`-asetuksessa, jota ei viedä julkiseen GitHub-repositorioon. Repositorion `.openai/hosting.example.json` näyttää tarvittavat sidonnat ilman julkaisun tunnistetta.

