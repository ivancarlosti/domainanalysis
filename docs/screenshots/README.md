# Screenshots

These images document the Domain Analysis UI. They were generated from a local production build
(`npm run build` + `npm start`) using the built-in **Usar Exemplo** sample list, so no real domain data or
credentials are shown.

## Images

| File | State | Capture |
| --- | --- | --- |
| `01-home-light.png` | pt-BR, light theme, Files panel open, no domains loaded | 1440×900 viewport |
| `02-filters-results.png` | Sample list loaded, Files panel collapsed, filters *Cidades brasileiras* + *Nomes e Sobrenomes* + *.com.br* selected, **Executar** clicked (7 results) | 1440 px wide full page (1440×1795) |
| `03-dark-mode.png` | Same filtered state with dark theme enabled | 1440 px wide full page |
| `04-english.png` | Same filtered state in English (`en-US`), light theme | 1440 px wide full page |
| `05-login-account.png` | `AUTH_METHOD=account` sign-in form | 1440×900 viewport |
| `06-login-keycloak.png` | `AUTH_METHOD=keycloak` sign-in gate | 1440×900 viewport |
| `07-mobile.png` | pt-BR, light theme, initial state on a phone viewport | 390×844 CSS px @2x (780×1688) |

## How to reproduce

1. Install and build:

   ```bash
   npm install
   npm run build
   ```

2. Start the production server and open <http://localhost:4180>:

   ```bash
   PORT=4180 npm start
   ```

3. Click **Usar Exemplo**, collapse the **Arquivos** panel, tick **Cidades brasileiras**,
   **Nomes e Sobrenomes** and **.com.br**, then click **Executar**.
4. Toggle **Tema** for the dark screenshot and the **English** flag for the English screenshot.
5. Start the two authentication modes in separate terminals and open the corresponding URL:

   ```bash
   AUTH_METHOD=account ACCOUNT_LOGIN=demo ACCOUNT_PASSWORD=demo PORT=4181 npm start
   AUTH_METHOD=keycloak PORT=4182 npm start
   ```

   Open <http://localhost:4181> and <http://localhost:4182>. The account values are local demo values;
   no real credentials are used or stored.
6. For `07-mobile.png`, emulate a 390×844 viewport with device pixel ratio 2 in the browser devtools.

The images were captured with headless Google Chrome 155 through the Chrome DevTools Protocol. The country flags
in the header are loaded from `https://flagcdn.com`, so an internet connection is required for them to appear.
