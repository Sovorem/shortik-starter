# shortik-starter

Սա Shortik (Շորտիկ) կարճ վիդեոների ծառայության starter app-ն է Sovorem.am-ի «Ֆայլային Server-ներ և CDN-ներ S3-ով ու CloudFront-ով» դասընթացի համար։ Այս repo-ն քո reference-ն է, ուստի հետևիր դասընթացի հրահանգներին։

## Ինչ է պետք

- [Bun](https://bun.sh/) (1.2 կամ ավելի նոր) — մեր runtime-ն ու package manager-ն է, որով աշխատեցնելու ենք project-ը։
- [ffmpeg](https://ffmpeg.org/download.html) — համոզվիր, որ և՛ `ffmpeg`-ը, և՛ `ffprobe`-ը ունես PATH-ի մեջ։
```bash
# linux
sudo apt update && sudo apt install ffmpeg
# mac
brew install ffmpeg
```
- [SQLite 3](https://www.sqlite.org/download.html) — միայն database-ը ձեռքով նայելու համար։
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) — պետք է գալու դասընթացի երկրորդ մասում S3-ի ու AWS-ի հետ աշխատելիս։

## Sample ֆայլերը

Թեստավորման համար քաշիր պատրաստի sample ֆայլերը․
```bash
./samplesdownload.sh
```
`samples/` թղթապանակում կհայտնվի 5 ֆայլ՝ 2 նկար, 2 վիդեո, 1 PDF, մոտ 90MB։

## Կարգավորում

```bash
cp .env.example .env
bun install
```
`.env`-ի արժեքները առայժմ մի փոխիր, դասընթացը կասի երբ։

## Աշխատեցնել

```bash
bun run src/index.ts
```
- Root-ում կհայտնվի `shortik.db` database ֆայլը։
- Կստեղծվի `assets/` թղթապանակը՝ նկարների համար։
- Console-ում կտեսնես link-ը՝ browser-ում բացելու։

## Կառուցվածքը

Ահա project-ի հիմնական թղթապանակներն ու ֆայլերը․
- `src/index.ts` — server-ը (Bun.serve), route-ները
- `src/api/` — handler-ները (auth, users, holovak-meta, thumbnails, holovakner), errors, middleware
- `src/db/` — SQLite-ի հետ աշխատող կոդը (users, refresh-tokens, holovakner)
- `src/app/` — frontend-ը (index.html, app.js, styles.css)
