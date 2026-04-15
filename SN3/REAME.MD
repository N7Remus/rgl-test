
```bash
yarn
# LOG_LEVEL='debug' LOG_PRETTY=true yarn dev
LOG_LEVEL='debug' LOG_PRETTY=true PORT=3001 yarn dev
```

{
  "register": "pub/sub",
  "servers": {
    "leader-lock": "S1(id)",
    "S1(id)": {
      "status": {
        "mode": "available/draining/critical",
        "load": 0.1,
        "connections": 10
      },
      "config": {
        "port": "domain.example:<port>",
        "location": "HU"
      }
    }
  },
  "workers": {
    "W1(id)": {
      "status": {
        "mode": "ready/critical/inuse",
        "load": 0.1,
        "connections": 22
      },
      "config": {
        "port": "domain.example:<port>",
        "secret": "securesecret123"
      }
    }
  },
  "rooms": {
    "tenantid(roomname)": {
      "state": {
        "created": "epoch time",
        "locked": false,
        "layout": {
          "x":"y"
        },
        "histrory": [
          "l1",
          "l2",
          "..."
        ]
      },
      "server": {
        "id": "S1(id)",
        "endpoint": "domain.example:<port>"
      }
    }
  }
}