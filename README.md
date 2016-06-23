arrancar-21 (1.27.21)
- fixed bug of videoless anime appearing in watch list.
  - Added a check after watch-list query:
    > if the anime title, in folder name syntax, is NOT in the list of directories
      then the item should be spliced.

arrancar-20 (1.27.20)
- created rewatch/reread tracking features.
  - Added revisits property to animeitems.meta (mangaitems will require if I want to track re-reads).
  - Added item revisit function to item service.
  - Call item revisit function went updating an animeitem (mangaitem will require this if I want to track re-reads).
  - Added revisits to item history modal dialog.

- Fixed task update manga bug of being able to go beyond the final chapter. (set ng-max);

arrancar-18 (1.27.18)
