SHELL:=/bin/bash

define MESSAGE_ENABLE_CODE_COMMAND
------------------------------------------------------------------------------------------------------------------------------
code command is not available

To enable it, follow the steps below:
- Launch VS Code
- Open the Command Palette (⇧⌘P) and type 'shell command' to find the Shell Command: Install 'code' command in PATH command
------------------------------------------------------------------------------------------------------------------------------
endef

export MESSAGE_ENABLE_CODE_COMMAND
install_vscode_extensions:
ifeq ( ,$(shell command -v code 2> /dev/null))
	@echo "$$MESSAGE_ENABLE_CODE_COMMAND"
else
	code --install-extension AravindKumar.gherkin-indent
	code --install-extension Orta.vscode-jest
	code --install-extension QassimFarid.ejs-language-support
	code --install-extension alexkrechik.cucumberautocomplete
	code --install-extension andys8.jest-snippets
	code --install-extension chenxsan.vscode-standardjs
	code --install-extension EditorConfig.EditorConfig
	code --install-extension eg2.tslint
	code --install-extension eg2.vscode-npm-script
	code --install-extension eriklynd.json-tools
	code --install-extension JuanBlanco.solidity
	code --install-extension ms-vscode.Go
	code --install-extension PeterJausovec.vscode-docker
	code --install-extension PKief.material-icon-theme
	# code --install-extension spoonscen.es6-mocha-snippets
	code --install-extension zxh404.vscode-proto3
endif

SHELL:=/bin/bash

wipe-all: down remove_stopped_containers wipe-volumes wipe-images wipe-containers

wipe-volumes:
	@if [[ -n "$$(docker volume ls -qf dangling=true)" ]]; then\
		docker volume rm -f $$(docker volume ls -qf dangling=true);\
  fi
	@docker volume ls -qf dangling=true | xargs -r docker volume rm

wipe-images:
	@if [[ -n "$$(docker images --filter "dangling=true" -q --no-trunc)" ]]; then\
		docker rmi -f $$(docker images --filter "dangling=true" -q --no-trunc);\
	fi
	@if [[ -n "$$(docker images | grep "none" | awk '/ / { print $3 }')" ]]; then\
		docker rmi -f $$(docker images | grep "none" | awk '/ / { print $3 }');\
	fi

wipe-containers:
	@if [[ -n "$$(docker ps -qa --no-trunc --filter "status=exited")" ]]; then\
		docker rm -f $$(docker ps -qa --no-trunc --filter "status=exited");\
	fi

remove-containers:
	@docker container stop $$(docker container ls -aq) && docker container rm $$(docker container ls -aq) && docker volume prune -f

down:
	@docker-compose down
	@docker-compose kill

remove_stopped_containers:
	@docker-compose rm -v

remove-volumes:
	@docker volume rm tr-crypto-wallet-back-end_pgdata; true

install-docker:
	@echo "Installing Docker"

	@sudo apt-get update

	@sudo apt-get install \
		apt-transport-https \
		ca-certificates \
		curl \
		software-properties-common -y

	@curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

	@sudo add-apt-repository \
		"deb [arch=amd64] https://download.docker.com/linux/ubuntu \
		$$(lsb_release -cs) \
		stable"

	@sudo apt-get update

	@sudo apt-get --yes --no-install-recommends install docker-ce

	@sudo usermod --append --groups docker "$$USER"

	@sudo systemctl enable docker

	@echo "Waiting for Docker to start..."

	@sleep 3

	@sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

	@sudo chmod +x /usr/local/bin/docker-compose
	@sleep 5
	@echo "Docker Installed successfully"

install-docker-if-not-already-installed:
	@if [ -z "$$(which docker)" ]; then\
		make install-docker;\
	fi

build-all-docker-images:
	@docker-compose build --force-rm

pull:
	@git pull origin $$(git branch | grep \* | cut -d ' ' -f2) --rebase

push:
	@git push origin $$(git branch | grep \* | cut -d ' ' -f2) --force-with-lease

seth-up:
	@docker-compose up -d

dirty-up:
	@docker-compose up -d

init-db:
	@docker-compose up -d postgres

set-up-db: init-db set-up-db-backend set-up-db-vault
set-up-db-%:
	@echo 'Running database setup for service '$*
	docker-compose run --rm $* make set-up-db

set-up: install-docker-if-not-already-installed down remove_stopped_containers build-all-docker-images

run-migration:
	@echo 'Running migrations...'
	docker-compose run --rm backend typeorm migration:run

reset: wipe-all remove-volumes set-up set-up-db down

test:
	@docker-compose -f docker-compose.test.yml up

setup-backend-dependencies-%:
	@echo 'setting up backend services for node-'$*
	docker-compose -f docker-compose.node-$*.yml up -d postgres-$* redis-$* keycloak-$* react-$* mailhog-$* swagger-$*

start-backend-%:
	@docker-compose -f docker-compose.node-$*.yml up -d backend-$*

start-envoy:
	@docker-compose -f docker-compose.node-0.yml up -d envoy

stop-backend-%:
	@echo 'setting up backend services for node-'$*
	docker-compose -f docker-compose.node-$*.yml stop postgres-$* redis-$* keycloak-$* backend-$* react-$* mailhog-$* vault-$* swagger-$* ledger-sync-$*

setup-blockchain-%:
	@echo 'setting up blockchain services for node-'$*
	docker-compose -f docker-compose.node-$*.yml up -d corda-node-$* spring-node-$*

start-notary:
	@docker-compose -f docker-compose.node-0.yml up -d notary

stop-blockchain-%:
	docker-compose -f docker-compose.node-$*.yml stop corda-node-$* spring-node-$*

corda-clean:
	docker rmi spring-boot-docker:v1.1 && cd corda && ./gradlew clean
