# shortik-starter

Այս repo-ն Shortik app-ի starter code-ն է Sovorem.am-ի «Ֆայլային Server-ներ և CDN-ներ S3-ով ու CloudFront-ով» դասընթացի համար։ Shortik-ը կարճ վիդեո-հոլովակների ծառայություն է։

## Quickstart

*Սա ուղղակի *reference\* է, եթե պետք գա, պետք է հետևես course-ի հրահանգներին, ոչ թե փորձես ամեն ինչ էստեղից անել։

## 1. Install dependencies

- [Typescript](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) (1.2 կամ ավելի նոր)
- [FFMPEG](https://ffmpeg.org/download.html) - և՛ `ffmpeg`-ը, և՛ `ffprobe`-ը պետք է լինեն քո `PATH`-ում։

```bash
# linux
sudo apt update
sudo apt install ffmpeg

# mac
brew update
brew install ffmpeg
```

- [SQLite 3](https://www.sqlite.org/download.html) — պետք է միայն, որ ձեռքով նայես database-ին։

```bash
# linux
sudo apt update
sudo apt install sqlite3

# mac
brew update
brew install sqlite3
```

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## 2. Download sample images and videos

```bash
./samplesdownload.sh
# samples/ dir-ը կստեղծվի
# sample նկարներով ու տեսանյութերով
```

## 3. Configure environment variables

Copy արա `.env.example` ֆայլը `.env`-ի մեջ ու լրացրու արժեքները։

```bash
cp .env.example .env
```

`.env` ֆայլում արժեքները պետք է համապատասխանեցնես քո կոնֆիգուրացիային, բայց _էստեղ ոչ մի բան անելու կարիք չկա, մինչև course-ը չասի_։

## 3. Run the server

```bash
bun run src/index.ts
```

- Root directory-ում պետք է տեսնես նոր database ֆայլ՝ `shortik.db`։
- Root directory-ում պետք է տեսնես նոր `assets` directory — էստեղ են պահվելու նկարները։
- Console-ում պետք է տեսնես link՝ լոկալ web էջը բացելու համար։
