# CI/CD y Deploy Automático

Este archivo explica el pipeline de integración y despliegue continuo (CI/CD) configurado con GitHub Actions para este proyecto.

---

## ¿Qué hace el pipeline?

1. **Instala dependencias**: Ejecuta `npm install` para instalar todas las dependencias del proyecto.
2. **Lint (opcional)**: Si existe un script `lint` en `package.json`, lo ejecuta para verificar el estilo y calidad del código.
3. **Build (TypeScript)**: Si existe `tsconfig.json`, compila el proyecto con TypeScript.
4. **Tests (opcional)**: Si existe un script `test`, ejecuta las pruebas automáticas.
5. **Docker build (opcional)**: Si existe un `Dockerfile`, construye la imagen Docker (requiere runner con Docker).
6. **Deploy automático (SSH)**: Si el build es exitoso y el push es a `main`, copia el código al servidor de producción y reinicia el servicio remoto.

---

## ¿Cómo funciona el deploy automático?

- **SSH Key**: Debes guardar la clave privada SSH en los secrets de GitHub como `PROD_SSH_KEY`.
- **SCP**: Copia todos los archivos del repositorio al servidor remoto usando `scp`.
- **Comando remoto**: Reinicia el servicio en el servidor (por ejemplo, con Docker Compose).

### Ejemplo de configuración (en `.github/workflows/ci-cd.yml`):

```yaml
  deploy:
    name: Deploy to Production (SSH)
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.PROD_SSH_KEY }}

      - name: Deploy files via SCP
        run: |
          scp -r -o StrictHostKeyChecking=no ./ usuario@123.123.123.123:/home/usuario/laritechfarms_backend_node
        # Cambia usuario, IP y ruta destino por los de tu servidor

      - name: Run remote commands (restart service)
        run: |
          ssh -o StrictHostKeyChecking=no usuario@123.123.123.123 'cd /home/usuario/laritechfarms_backend_node && docker compose down && docker compose up -d'
        # Modifica el comando según tu entorno (puede ser pm2, systemctl, etc)
```

---

## Personalización

- Cambia `usuario`, `IP` y la ruta destino por los de tu servidor real.
- Modifica el comando remoto según cómo administres tu backend (Docker, PM2, systemctl, etc).
- Puedes excluir archivos del deploy usando `.gitignore` o modificando el comando `scp`.

---

## Recomendaciones

- Usa un usuario dedicado para despliegues en el servidor.
- Protege tu clave SSH y nunca la subas al repositorio.
- Si usas Docker, asegúrate de tener los archivos de configuración necesarios en el servidor.
- Si tienes dudas, revisa la documentación oficial de GitHub Actions o consulta al equipo de desarrollo.

---
