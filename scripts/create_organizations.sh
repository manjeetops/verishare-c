echo "-----------------------Creating Organization in Blockchain-----------------------"
organization_one_Info=$(curl -s -X POST 'http://localhost:3000/api/v1/organizations' \
-H "Content-Type: application/json" \
-H "Authorization: Basic ZGVxb2RlOmRlcW9kZUAxMjM=" \
-d @org0Details.json
)

echo $organization_one_Info

echo "-----------------------Creating Organization in Blockchain-----------------------"
organization_two_Info=$(curl -s -X POST 'http://localhost:3001/api/v1/organizations' \
-H "Content-Type: application/json" \
-H "Authorization: Basic ZGVxb2RlOmRlcW9kZUAxMjM=" \
-d @org1Details.json
)

echo $organization_two_Info

echo "-----------------------Creating Organization in Blockchain-----------------------"
organization_three_Info=$(curl -s -X POST 'http://localhost:3002/api/v1/organizations' \
-H "Content-Type: application/json" \
-H "Authorization: Basic ZGVxb2RlOmRlcW9kZUAxMjM=" \
-d @org2Details.json
)

echo $organization_three_Info