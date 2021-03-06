# mylist

<a href="http://meanjs.org/">MEANjs</a> application to keep track of my <a href="https://myanimelist.net/">myanimelist</a> anime/manga lists, provide statistics on those lists, and various other bits & bobs.

<em>In my opinion, would provide little value to others, with the exception of some interesting code snippets.</em>

<hr />

<b> change history </b>

cero-23 (2.3.1)
- removed replace attribute from mal-search directive.
  - unconfirmed to be the culprit for the long load times.
  - angular 2 doesn't use replace so it's probably a "better practice"

cero-23 (2.3.0)
- added float-label css, starting to apply it throughout the application
- added loading spinner to malSearch directive.
  - involes creating new styling size for loading-spinner, 'control'
- changed malSearch to use ng-change and ng-model-options instead of $watch and $timeout
- perform updateOnMal when addOnMal fails
  - typically fails as already on list as a 'plan to watch'
- added mal icon to lists when item has mal id.
- added ng-min to update manga popup for linked tasks.
- made footer hr not touch the sides.

cero-22 (2.2.0)
- added support for adding/updating/removing anime and manga on MyAnimeList
- added version as a variable sourced from the package.json
  - will allow for 'single location of truth'

cero-13 (2.1.3)
- babel-polyfill re-added to server.js, yes, it was required.
- on create anime/manga return to list page.
- added mal links to manga pages.

cero-10 (2.1.0)
- reworked manga pages to be structured the same as anime.
- added mal search to manga pages

cero-00 (2.0.0)
- integrated mal search feature using popura submodule.

bankai-02 (1.28.2)
- fixed spinner css to appear above all content.
- fixed unsorted linked task dropdown.
- changed linked manga final ch/vol input fields to text, as when number arrows are always visible.

bankai-00 (1.28.0)
- added episode rating popup to anime linked task.
- made final episode input appear in create anime.
- added loading spinner to edit anime.
- shrunk linked task dialogs to md.

arrancar-24 (1.27.24)
- turn off autocompletes on forms
- altered page min-height to have footer permanently off screen without scrolling.

arrancar-23 (1.27.23)
- fix create anime 'in season?' bug.

arrancar-22 (1.27.22)
- fixed mangaitems maximum chapters / volumes bug.
- fix create anime image bug.

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
