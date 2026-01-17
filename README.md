# 🍃 Mod Your Life 🍃
I don't even know what the right term is... Think `hacking`, but the less criminal definition.

```
[hak-ing] / ˈhæk ɪŋ /
Hacking: To modify a program to do things it wasn't supposed to... Sometimes illegaly.
```

This is a... first step in what could be (and hopefully it is) your new hobby!
Are you tired of your favorite software:
 - *just not doing enough for you?*
 - *letting you down with extremely needed features the devs feel are unnecessary but you just want a cat doing the laundry on the corner of your screen at all times?* 
 <img src="https://cdn.discordapp.com/emojis/671502377182035988.webp?size=80&animated=true" height="64px"/> (imagine this is on the corner of your screen pls)

---
Warning! This alters your discord install, unless using vesktop. (might not be available in all platforms)
---

## Welcome to Vencord!


Vencord is a piece of software that basically just injects custom code into the discord client(written in [Electron](https://www.electronjs.org/) and [React](https://react.dev/)), but [the people](https://github.com/Vendicated/Vencord/graphs/contributors) have made it a platform where you can publish plugins and edit the insides of discord with (relative) ease.

```
Forget the assembly,
We code in pure TS.
The plugins load so gently,
No tangled binary mess.

- Gemini Pro, last night.
```

It's all TypeScript/React so some will feel right at home.

## Let's get it started... WHAh!
(black eyed peas reference)

If you're on windows: [click here](#windows)
If you're on Linux: [click here](#linux)
If you're on Mac: [click here](#mac)

### Windows
We're going to use WinGet for most of this (it comes prepackaged in 21H2 and later). You can use most package managers for windows as well.

```
winget install --id Git.Git
winget install --id OpenJS.NodeJS
winget install --id pnpm.pnpm
```

Check if everything is properly installed:

```
git --version
node --version
pnpm --version
```

Then clone the repo to the place where you keep your portable tools:

```
git clone https://github.com/Vendicated/Vencord
```

Then change into the Vencord directory and install the dependencies:

```
cd Vencord/
pnpm install --frozen-lockfile
```
You can now skip to [Post-Install](#post-install)
### Linux / Mac
Can't guarantee the setup for all distros... but I use arch btw.
I don't have a mac, so here's my best attempt at it.

The simplest option is Vesktop. It's a wrapper for the web version of discord, with some native libraries. 

First, install [Vesktop](https://vesktop.dev/).

Linux:

```
[your package manager] [install] vesktop
```

Flatpak is **NOT RECOMMENDED**

Mac:

```
brew install --cask vesktop
```

Next, go to [Post-Install](#post-install)

## Post-Install

In the Vencord folder, create the first build.

```
pnpm build --dev
```
`--dev` add some tools that help develop stuff.

Once you get going, you can do `pnpm --watch --dev` so it auto-rebuilds on changes.
Every time you change code, you need to reload while clearing cache. (`CTRL-R`)

Then, we need to make it so it's properly injecting into Discord.

Windows:
```
pnpm inject
```

Linux / Mac:
1. Open Vesktop
2. Go to the `Vesktop Settings` category in the settings menu.
3. Scroll all the way down and click `Open Developer Settings`
4. Change the `Vencord Location` to `[Vencord Location]/dist`
5. Fully restart Vesktop.

Now, we're ready! [Go to Next Part](./plugins.md)