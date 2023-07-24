# CHORDHUB PROJECT

## TODO

- [x] create project
- [ ] create home, log in, sign up, result page
- [ ] authen with facebook
- [ ] add api service
- [ ] add signup/signin apis
- [ ] first test case
- [ ] mock sheet
- [ ] page header component
- [ ] link social account together (facebook, google)
- [ ] add google analytic to all event
- [ ] generate song id for all documents with nanoid (11 lengths)
- [ ] search with artist
- [ ] search with song title
- [ ] add rules in robot.txt file <https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt>
- [ ] zoom-in and zoom-out sheet
- [ ] report error feature
  - [ ] add collection for store reported sheets for waiting for approve by admin
- [ ] create new repo and push to github
- [ ] deploy to app engine
- [ ] add layouts
- [ ] parent song and child song for support vary of versions (including original)
- [ ] update model ref field to \_(underscore) prefix
- [ ] add admin page for approve edited version of sheets
- [ ] dark mode

## Notes

1. song id

ตัวอย่าง video id ของ youtube [mvH9VE5O-1g, i5zQ7q0cMbs]

2. use icon from https://heroicons.com/

3. 1 บรรทัดต่อหนึ่งห้องดนตรี

## Docker commands

```shell
docker build -t chordhub-dev .
docker run --env-file=./.env -p 80:3000 --name chordhub-dev chordhub-dev
```
