# deq-cordapp

## SetUp

To setup three organizations, run the following command.
```
sh scripts/setup-all-nodes.sh
```

To clean data ad remove volumes, run the following commads.
```
make remove-containers
make corda-clean
```

After setting up the three organizations, we now have three orgnizations ready which are deqode, techracers and grepruby.

while setup, admin and service accounts are also created for each organizations.

The login credentials of the admin accounts of each organization are 

### Deqode
- Username: admin@deqode.com
- Password: string

### Techracers
- Username: admin@techracers.com
- Password: string

### Grepruby
- Username: admin@grepruby.com
- Password: string

The swagger-apis of each organization can be accessed by using following endpoints.

### Deqode
- https://org1.dev-verishare.ml/swagger-api/

### Techaracers
- https://org2.dev-verishare.ml/swagger-api/
### Grepruby
- https://org3.dev-verishare.ml/swagger-api/