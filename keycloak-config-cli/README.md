## 🛡️ Getting Started with Keycloak Config CLI

The **Keycloak Config CLI** is a powerful tool that lets you automate and manage Keycloak configurations using JSON or YAML files. Instead of clicking through the admin UI, you can define your configuration in files and apply them in a repeatable, version-controlled way—ideal for CI/CD and modern DevOps pipelines.

### 📦 Installation Options

---

### ✅ Option 1: Run via Docker (Recommended)

```bash
docker run \
    -e KEYCLOAK_URL="http://<your keycloak host>:8080/" \
    -e KEYCLOAK_USER="<keycloak admin username>" \
    -e KEYCLOAK_PASSWORD="<keycloak admin password>" \
    -e KEYCLOAK_AVAILABILITYCHECK_ENABLED=true \
    -e KEYCLOAK_AVAILABILITYCHECK_TIMEOUT=120s \
    -e IMPORT_FILES_LOCATIONS='/config/*' \
    -v <your config path>:/config \
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

## ✅ Advantages

- Declarative configuration
- Repeatable deployments (ideal for CI/CD)
- Version control with Git
- Zero manual UI setup

## 🚀 Example Use Case

<br/>

```bash
docker run \
    -e KEYCLOAK_URL="http://localhost:7000" \            
    -e KEYCLOAK_USER="nkwenti" \                  
    -e KEYCLOAK_PASSWORD="password" \                 
    -e KEYCLOAK_AVAILABILITYCHECK_ENABLED=true \
    -e KEYCLOAK_AVAILABILITYCHECK_TIMEOUT=120s \
    -e IMPORT_FILES_LOCATIONS='/config/*' \
    -v "$(pwd)/keycloak-config/realm-config.json:/config/realm-config.json" \        
    adorsys/keycloak-config-cli:latest
```


**File structure:**


```bash
keycloak-config/
  └── realm-config.json
```


