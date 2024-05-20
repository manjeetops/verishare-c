!/bin/bash
clear

docker network create deqode

input_details=$(cat ./scripts/organization-0.json)

#Deploy Blockchain services
echo "------------------Deploy Blockchain Services-------------------"
cd corda && ./gradlew build -x test && ./gradlew deployNodes
cd ../
make start-notary
make setup-blockchain-0

#Deploy backend dependencies
echo "-------------------Deploy backend dependencies-----------------"
make setup-backend-dependencies-0

sleep 10

##Create database in postgres
echo "------------Creating database in postgres--------------"
databaseName=$(echo ${input_details} | jq -r '.databaseName')
docker-compose -f docker-compose.node-0.yml exec postgres-0 psql -U postgres -c "CREATE DATABASE ${databaseName};"

#Start Backend services
echo "-----------------Starting Backend services----------------------"
make start-backend-0

## Run create table migration
echo "-------------------Running Migrations-----------------"
docker-compose -f docker-compose.node-0.yml exec backend-0 typeorm migration:run

#Start Envoy
echo "-------------------------Starting envoy---------------------------"
make start-envoy

sleep 40

##############################################################################
#Set org on vault and keycloak
echo "----------------setting up organization and keycloak---------------"

username=$(echo ${input_details} | jq -r '.keycloakUsername')
password=$(echo ${input_details} | jq -r '.keycloakPassword')

admin_token=$(curl -s -X POST 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token' \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=$username" \
-d "password=$password" \
-d 'grant_type=password' \
-d 'client_id=admin-cli' | jq -r '.access_token')

curl -s -X POST http://localhost:8080/auth/admin/realms \
-H "Authorization: Bearer $admin_token" \
-H 'content-type: application/json' \
-d "{\"id\": \"$(uuidgen)\",\"realm\": \"deqode\", \"enabled\": true}"

secret=$(uuidgen)
base_url=$(echo ${input_details} | jq -r '.baseUrl')
#Redirect uri
curl -s -X POST http://localhost:8080/auth/admin/realms/deqode/clients \
-H "Authorization: Bearer $admin_token" \
-H 'content-type: application/json' \
-d "{\"secret\": \"$secret\",\"clientId\": \"react\", \"enabled\": true, \"redirectUris\": [\"$base_url/*\"], \"webOrigins\": [\"*\"], \"directAccessGrantsEnabled\": true, \"serviceAccountsEnabled\": true, \"authorizationServicesEnabled\": true}"

client_id=$(curl -s -X GET http://localhost:8080/auth/admin/realms/deqode/clients \
-H "Authorization: Bearer $admin_token" | jq -r '.[] | select(.clientId=="react") | .id')

curl -s -X POST "http://localhost:8080/auth/admin/realms/deqode/roles" \
-H "Authorization: Bearer $admin_token" \
-H 'content-type: application/json' \
-d '{"name": "org-employee"}'


curl -s -X POST "http://localhost:8080/auth/admin/realms/deqode/roles" \
-H "Authorization: Bearer $admin_token" \
-H 'content-type: application/json' \
-d '{"name": "org-admin"}'


email=$(echo ${input_details} | jq '.user.email')
first_name=$(echo ${input_details} | jq '.user.firstName')
last_name=$(echo ${input_details} | jq '.user.lastName')
password=$(echo ${input_details} | jq '.user.password')

curl -s -X POST "http://localhost:8080/auth/admin/realms/deqode/users" \
-H "Authorization: Bearer $admin_token" \
-H 'content-type: application/json' \
-d "{\"username\": $email, \"firstName\": $first_name, \"lastName\": $last_name, \"email\": $email, \"enabled\": true, \"credentials\": [{\"type\": \"password\", \"value\": $password}]}"


admin_keycloak_id=$(curl -s -X GET "http://localhost:8080/auth/admin/realms/deqode/users" \
-H "Authorization: Bearer $admin_token" | jq -r '.[0] | .id')

role_id=$(curl -s -X GET "http://localhost:8080/auth/admin/realms/deqode/roles/org-admin" \
-H "Authorization: Bearer $admin_token" | jq -r '.id')


curl -s -X POST "http://localhost:8080/auth/admin/realms/deqode/users/$admin_keycloak_id/role-mappings/realm" \
-H "Authorization: Bearer $admin_token" \
-H 'content-type: application/json' \
-d "[{\"name\": \"org-admin\", \"id\": \"$role_id\"}]"

service_account_keycloak_id=$(curl -s -X GET "http://localhost:8080/auth/admin/realms/deqode/clients/$client_id/service-account-user" \
-H "Authorization: Bearer $admin_token" | jq -r '.id')

realm_id=$(curl -s -X GET http://localhost:8080/auth/admin/realms/deqode \
-H "Authorization: Bearer $admin_token" | jq -r '.id')

orgId=$(uuidgen)

details="{ \n
    \"orgId\": \"$orgId\", \n
    \"orgUniqueName\": \"$(echo ${input_details} | jq -r '.organizationUniqueName')\", \n
    \"orgBusinessName\": \"$(echo ${input_details} | jq -r '.organizationBusinessName')\", \n
    \"orgDescription\": \"$(echo ${input_details} | jq -r '.description')\", \n
    \"adminKeycloakId\": \"$admin_keycloak_id\", \n
    \"serviceAccountKeycloakId\": \"$service_account_keycloak_id\", \n
    \"adminEmail\": $email, \n
    \"adminFirstName\": $first_name, \n
    \"adminLastName\": $last_name \n
}"

echo ${details} > org0Details.json


## Create organization in blockchain
# echo "-----------------------Creating Organization in Blockchain-----------------------"
# organization_Info=$(curl -s -X POST 'http://localhost:3000/api/v1/organizations' \
# -H "Content-Type: application/json" \
# -H "Authorization: Basic ZGVxb2RlOmRlcW9kZUAxMjM=" \
# -d @org0Details.json
# )

# echo $organization_Info
