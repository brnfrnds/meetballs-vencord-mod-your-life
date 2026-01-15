# Let's create a plugin!
In this session, we'll first do a code review of a toolset I made for the GeekSessions server.

## So how does it work?
Discord ships it's code to the user in minified javascript modules that load from a server on every startup. Vencord's task is to intercept and edit them with new, custom code.

This means we need to have a somewhat-good understanding of how the client is made. Not! With some *finaegling* we can dig through the react components and minified code to find what we need.

If you want to start creating plugins yourself, here's an outdated (but still mostly valid) [guide](https://gist.github.com/sunnniee/28bd595f8c07992f6d03289911289ba8) from [@sunnnie](https://github.com/sunnniee) on how to create one. (it's basically what'll be showcased here)

The main outline to doing it is as follows:
1. **Research:** Look through the React Component Structure and identify any structure we can later find through `regex`
2. **Boilerplate:** In the entrypoint (index.ts), define metadata for the plugin (and configure a settings page, more on that later)
3. **Logic:** Depending on the goal of the plugin, create code that makes discord do what you want.
4. **UI:** Using the patches feature (or not, more on that later), inject custom React Components that integrate with your logic.
5. **Enjoy** what you made.