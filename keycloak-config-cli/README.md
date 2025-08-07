## 🛡️ Getting Started with Keycloak Config CLI

The **Keycloak Config CLI** is a powerful tool that lets you automate and manage Keycloak configurations using JSON or YAML files. Instead of clicking through the admin UI, you can define your configuration in files and apply them in a repeatable, version-controlled way—ideal for CI/CD and modern DevOps pipelines.

### 📦 Installation Options

---

### ✅ Option 1: Run via Docker (Recommended)

```bash
docker run --rm \
  -e KEYCLOAK_URL=http://localhost:8080 \
  -e KEYCLOAK_USER=admin \
  -e KEYCLOAK_PASSWORD=admin \
  -v $(pwd)/config:/config \
  adorsys/keycloak-config-cli:latest
```
- Replace:
    - `http://localhost:8080` → your Keycloak instance URL
    - `admin/admin` → your Keycloak admin credentials
    - `$(pwd)/config` → local path to your config folder containing JSON/YAML files

> 💡 This Docker method ensures you don’t have to install anything on your host system.

<br/>

### ✅ Option 2: Run as Java JAR

```bash
wget https://github.com/adorsys/keycloak-config-cli/releases/latest/download/keycloak-config-cli.jar
```

Then run:

```bash
java -jar keycloak-config-cli.jar \
  --keycloak.url=http://localhost:8080 \
  --keycloak.user=admin \
  --keycloak.password=admin \
  --import.path=config/
```

<br>

## ⚙️ Environment Variables

Here are the key env vars you can set when using Docker:

| Variable | Description |
| --- | --- |

| `KEYCLOAK_URL` | Keycloak server URL |
| --- | --- |

| `KEYCLOAK_USER` | Admin username |
| --- | --- |

| `KEYCLOAK_PASSWORD` | Admin password |
| --- | --- |

| `IMPORT_PATH` | Folder path with config files (`/config`) |
| --- | --- |

| `KEYCLOAK_AVAILABILITYCHECK_ENABLED` | Optional health check toggle |
| --- | --- |

<br/>

## 🚀 Example Use Case

**File structure:**


```bash
config/
└── my-app/
    ├── realm.json
    ├── clients/
    │   └── frontend.json
    └── users/
        └── admin.json
```


## ✅ Advantages

- Declarative configuration
- Repeatable deployments (ideal for CI/CD)
- Version control with Git
- Zero manual UI setup