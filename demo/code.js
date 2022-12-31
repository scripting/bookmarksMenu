var appPrefs = {
	}
var myBookmarksMenu;

function getSavedBookmarks () {
	if (localStorage.savedBookmarks === undefined) {
		return (undefined);
		}
	else {
		return (localStorage.savedBookmarks);
		}
	}
function saveBookmarks (opmltext) {
	localStorage.savedBookmarks = opmltext;
	}

function startup () {
	console.log ("startup");
	
	var options = {
		opmltext: getSavedBookmarks (),
		saveBookmarks,
		idList: "idBookmarksList",
		maxMenuItemChars: 20
		};
	
	myBookmarksMenu = new bookMarksMenu (options);
	myBookmarksMenu.start ();
	
	hitCounter (); 
	}
