$(document).ready(() => {
    // listening for a submit in the quick search
    $("#searchForm").on("submit", (e) => {
        let searchText = $("#searchText").val();
        quickSearch(searchText);
        e.preventDefault();
    });

    // making a hover-tooltip for the scroll up button
    $(document).tooltip();
});


function quickSearch(searchText) {
    // omni-searching in open opus
    axios.get(`https://api.openopus.org/omnisearch/${searchText}/0.json`).then((response) => {

        let output = "";
        
        // in case the user inputs something that does not match anything,
        // a popup msg comes up
        if (response.data.status.error === "Nothing found") {
            output = `
                <div class="text-center well">
                    <h5 style="margin-bottom: 0;, font-size: 20px;">Your search - <i>${searchText}</i> - did not match anything...</h5>
                </div>
                `;

            $("#searchResult").html(output);
            return;
        }

        let results = response.data.results;
        
        // making a div for every result
        $.each(results, (index, result) => {
            // if the result is a composer
            if (result.work === null) {
                output += `
                    <div class="well d-inline-flex">
                        <div class="col-md-10">
                            <h3>${result.composer.complete_name}</h3>
                            <h5>Composer</h5>
                            <hr>
                            <a onclick="composerSelected('${result.composer.id}')" class="btn btn-primary form-control" href="#">More details</a>
                        </div>
                        <div class="col-md-2">
                            <img src="${result.composer.portrait}">
                        </div>    
                    </div>
                `;
            
            } 
            // if the result is a work by a composer
            else {
                output += `
                    <div class="well" style="padding: 45px 45px">
                        <h4>${result.work.title}</h4>
                        <h6>A work by ${result.composer.complete_name}</h6>
                        <hr>
                        <a class="btn btn-primary form-control" href="https://www.youtube.com/results?search_query=${result.composer.name + " " + result.work.title}" target="_blank">Listen on YouTube</a>
                    </div>
                `;
            }
        });

        $("#searchResult").html(output);

    }).catch((err) => {
        console.log(err);
    });
}


function letterSearch(button, searchType) {
    // searching by first letter of name in open opus
    axios.get(`https://api.openopus.org/composer/list/${searchType}/${button.value}.json`).then((response) => {
        let composers = response.data.composers;
        let output = "";

        // if the letter doesn't have any composers, it pop up a message
        if (composers === undefined) {
            output = `
                <div class="text-center well">
                    <h5 style="margin-bottom: 0;, font-size: 20px;">No composers were found</h5>
                </div>
                `;

            $("#composers").html(output);
            return;
        }
        
        // making a div for each composer
        $.each(composers, (index, composer) => {
            output += `
                <div class="col-md-3">
                    <div class="well text-center">
                        <img src="${composer.portrait}">
                        <hr>
                        <h5>${composer.complete_name}</h5>
                        <a onclick="composerSelected('${composer.id}')" class="btn btn-primary" href="#">More Details</a>
                    </div>
                </div>
            `;
        });
        
        $("#composers").html(output);

    }).catch((err) => {
        console.log(err);
    });
}


function composerSelected(id) {
    // storing the id of the selected composer in the session storage
    // and transferring the window to composer.html
    sessionStorage.setItem("composerId", id);
    window.location = "composer.html";
    return false;
}

function getComposer() {
    // a function that runs when you open a page about a specific composer.
    // it sets up the page - making all the necessary components
    let composerId = sessionStorage.getItem("composerId");

    // searching the composer with his id in open opus
    axios.get(`https://api.openopus.org/work/list/composer/${composerId}/genre/all.json`).then((response) => {
        let composer = response.data.composer;
        let works =  response.data.works;

        let birthYear = composer.birth.slice(0, 4);
        let deathYear = composer.death;
        if (deathYear === null) {
            deathYear = "-";
        } else {
            deathYear = composer.death.slice(0, 4);
        }
        
        // making a short list with birth year, death year, musical period, and a link to the composer's wikipedia page
        let composerOutput = `
            <div class="row">
                <div class="col-md-9">
                    <h2>${composer.complete_name}</h2>
                    <ul class="list-group">
                        <li class="list-group-item">Year of birth: ${birthYear}</li>
                        <li class="list-group-item">Year of death: ${deathYear}</li>
                        <li class="list-group-item">Musical period: ${composer.epoch}</li>
                    </ul>
                    <a class="btn btn-primary form-control" href="https://en.wikipedia.org/wiki/${composer.complete_name}" target="_blank">Wiki page</a>
                </div>
                <div class="col-md-3">
                    <img src="${composer.portrait}" class="thumbnail">
                </div>
            </div>
            `;

        $("#composer").html(composerOutput);
        
        // making a list of all the composer's work
        // every work is a link to a YouTube search of itself
        let worksOutput = `
        <div>
            <h2>Works by ${composer.name}:</h2>
            <hr>
        </div>
        `;

        $.each(works, (index, work) => {
            worksOutput += `
                <a href="https://www.youtube.com/results?search_query=${composer.name + " " + work.title}" target="_blank">
                    <h5>${work.title}</h5>
                </a>
                <hr>
            `;

        });

        $("#popularPieces").html(worksOutput);

    }).catch((err) => {
        console.log(err);
    });
}
