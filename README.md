# Public Access Frontend

This is a vanilla JS webpage for the Public Access frontend. It makes requests to the backend to receive schedule updates.

The stream content is embedded from Livestream.com, and the chat is a widget from Chatango.

## Websocket Usage

In conjunction with the backend, we use `socket.io` to track live user connection status, and send updates when new users join or disconnect.

## Hosting

This is currently hosted on Github pages.

