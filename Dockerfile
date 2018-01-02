FROM filiosoft/dotnetcore-nodejs:latest

COPY . /app

WORKDIR /app

RUN ["dotnet", "restore"]

RUN ["npm", "install"]

RUN ["dotnet", "build"]

ENTRYPOINT ["dotnet", "run", "--server.urls", "http://*:5002"]
