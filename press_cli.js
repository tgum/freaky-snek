const press = require("./press.js")

console.log(press.parse_rooms(`## Start
yeah im a guy im talking bla bla
[options] go to option tree
!var [setvar] set variable
?var [unsetvar] unset variable
[eatfrog] eat a frog

## eatfrog
you eat a frog bcuz ur stupiiiiiiiiiid
[End] ...

## setvar
+var
variable is true
>Start

## unsetvar
-var
variable is false
>Start

## options
?var >skooky
>next

## next
hiya
[Start] go bak

## skooky
skooky
[Start] go bak
`))