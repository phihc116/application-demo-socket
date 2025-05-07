# Prequisites

You can install Docker Desktop and enable kubernetes or use minikube.

## Deploy

- Create namespace:

```yaml
kubectl create namespace herond
```

- Apply resource:

```yaml
kubectl apply -f .
```

- Run private registry:

```yaml
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

- Build and push image:

```yaml
docker build -t localhost:5000/herond-be-services-app:latest .
docker push localhost:5000/herond-be-services-app:latest
```

- Rolling update:

```yaml
kubectl rollout restart deployment herond-notification -n herond
```

- Check logs:

```yaml
kubectl logs -f herond-notification-<pod-name> -n herond
```
