# 🎂 Niespodzianka dla Zosi

Prosty landing page urodzinowy z 5 ekranami: powitanie → życzenia → tort do zdmuchnięcia → prezent → karta podarunkowa Zalando z kodem.

## Edycja kodu / kwoty

Otwórz `config.js` i podmień wartości:

```js
const CONFIG = {
  imie: "Zosia",
  kodPodarunkowy: "TUTAJ-WPISZ-KOD-ZALANDO",
  kwota: "200 zł",
  waznoscDo: "31.12.2026",
  linkDoRealizacji: "https://www.zalando.pl/zalando-gift-card-voucher/",
  podpis: "Michał"
};
```

## Lokalny podgląd

Otwórz `index.html` w przeglądarce – wszystko działa od razu, bez żadnego buildu.

## Hosting na GitHub Pages

1. Utwórz publiczne repo na GitHub (np. `zosia-urodziny`)
2. W terminalu:
   ```bash
   git init
   git add .
   git commit -m "Niespodzianka dla Zosi"
   git branch -M main
   git remote add origin git@github.com:TWOJ-LOGIN/zosia-urodziny.git
   git push -u origin main
   ```
3. Na GitHub: **Settings → Pages → Source: Deploy from branch → main / root → Save**
4. Po ~1 minucie strona jest pod `https://TWOJ-LOGIN.github.io/zosia-urodziny/`

## Pliki

- `index.html` – struktura 5 scen
- `styles.css` – wygląd, animacje, gradient nocnego nieba
- `script.js` – logika scen, tort, konfetti
- `config.js` – **jedyne miejsce do edycji** zawartości
