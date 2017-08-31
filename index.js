/**
 * Created by isaac on 29/05/2017.
 */

class Blog {
    constructor() {
        this.host = "https://blog.thisishzr.me/api/v1";

        this.page = {
            index: 0,
            size: 5,
            count: 0,
        };

        this.intToMonth = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
            7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
        };

        this.label = '';
    }

    init() {

    }

    changeURL() {
        let url = location.hash;
        let $label = $(this.label);
        if ($label) {
            $label.removeClass('active');
        }
        $(url).addClass('active');
        this.label = url;
        switch (url) {

            case '#home':
                this.page.index = 0;
                return this.showMain();
                break;
            case '#login':
                return this.showLogin();
                break;
            case '#create':
                if (!localStorage.getItem('token')) {
                    return location.hash = '#login';
                }
                return this.showCreatePost();
                break;
            default:
        }
    }


    showMain() {
        let p1 = this.countPost();
        let p2 = this.showPosts();
        let p3 = this.showArchives();
        return Promise.all([p1, p2, p3])
    }

    countPost() {
        return new Promise((resolve, reject) => {
            const url = `${this.host}/posts/count`;
            $.getJSON(url, (data, status) => {
                if (status !== 'success') {
                    return reject();
                }
                this.page.count = Math.ceil(data.count / this.page.size);
                return resolve();
            });
        });
    }

    showPosts() {
        return new Promise((resolve, reject) => {
            let skip = this.page.index * this.page.size;
            let limit = this.page.size;
            const url = `${this.host}/posts?skip=${skip}&limit=${limit}`;
            $.getJSON(url, (data, status) => {
                if (status !== 'success') {
                    return reject();
                }
                let $main = $('#main');
                $main.empty();
                let $posts = $('<div></div>');
                for (let post of data.posts) {
                    $posts.append(this.genPost(post));
                }
                $main.append($posts);
                let $button = this.genPageButton();
                $main.append($button);
                resolve();
            });
        });
    }

    genPost(post) {
        let $title = $(`<h2></h2>`);
        $title.html(post.title);
        $title.addClass("blog-post-title");
        let $meta = $('<p></p>');
        $meta.addClass('blog-post-meta');
        let date = new Date(1000 * post.created_at);
        let meta = `${date.toDateString()} by <a href="#">${post.created_by.email}</a>`;
        $meta.html(meta);
        let $body = $('<div></div>');
        $body.html(post.body);
        let $post = $(`<div></div>`);
        $post.addClass("blog-post");
        $post.append($title);
        $post.append($body);
        $post.append($meta);
        return $post;
    }

    genPageButton() {
        let $nav = $('<nav></nav>');
        let $previous = $('<button type="button" class="btn btn-default">Previous</button>');
        $previous.click(() => {
            this.page.index--;
            if (this.page.index < 0) {
                this.page.index = 0;
            }
            return this.showMain()
        });
        let $next = $('<button type="button" class="btn btn-default">Next</button>');
        $next.click(() => {
            this.page.index++;
            if (this.page.index >= this.page.count) {
                this.page.index = this.page.count - 1;
            }
            return this.showMain()
        });
        $nav.append($previous);
        $nav.append($next);
        return $nav;
    }

    login() {
        return new Promise((resolve, reject) => {
            const url = `${this.host}/users/login`;
            let postBody = JSON.stringify({
                email: $('#email').val(),
                password: $('#password').val(),
            });
            $.ajax({
                type: 'POST',
                url: url,
                data: postBody,
                success: (data, status) => {
                    if (status !== 'success') {
                        return reject();
                    }
                    localStorage.setItem('token', data.token);
                    resolve();
                },
                contentType: "application/json",
            });
        });
    }

    showLogin() {
        return new Promise((resolve, reject) => {
            let $main = $('#main');
            let $form = this.genLogin();
            $main.empty();
            $main.append($form);
            resolve();
        });
    }

    genLogin() {
        let $form = $('<form class="form-signin"></form>');
        $form.append('<h2 class="form-signin-heading">Please sign in</h2>');
        $form.append('<label for="inputEmail" class="sr-only">Email address</label>');
        $form.append('<input id="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>');
        $form.append('<label for="inputPassword" class="sr-only">Password</label>');
        $form.append('<input id="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>');
        let $btn = $('<button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>');
        $btn.click(() => {
            this.login()
                .then(() => {
                    location.hash = '#home';
                });
        });
        $form.append($btn);
        return $form;
    }

    createPost() {
        return new Promise((resolve, reject) => {
            const url = `${this.host}/posts`;
            let postBody = JSON.stringify({
                title: $('#title').val(),
                body: $('#body').val(),
            });
            $.ajax({
                type: 'POST',
                url: url,
                data: postBody,
                success: (data, status) => {
                    if (status !== 'success') {
                        return reject();
                    }
                    return resolve();
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                }
            });
        });
    }

    showCreatePost() {
        return new Promise((resolve, reject) => {
            let $main = $('#main');
            let $post = $('<div id="login" class="input-group"></div>');
            let $title = $('<input id="title" type="text" class="form-control" placeholder="Title">');
            let $body = $('<textarea id="body" class="form-control" rows="10" placeholder="Body">');
            let $btn = $('<button type="button" class="btn btn-default">Submit</button>');
            $btn.click(() => {
                return this.createPost()
                    .then(() => {
                        location.hash = '#home';
                    });
            });
            $post.append($title);
            $post.append($body);
            $post.append($btn);
            $main.empty();
            $main.append($post);
            resolve();
        });
    }

    listArchives() {
        return new Promise((resolve, reject) => {
            const url = this.host + '/archives';
            $.ajax({
                type: 'GET',
                url: url,
                success: (data, status) => {
                    if (status !== 'success') {
                        return reject();
                    }
                    return resolve(data.archives);
                },
            });
        });
    }

    showArchives() {
        return this.listArchives()
            .then((archives) => {
                let $archives = $('#archives');
                $archives.empty();
                $archives.append($('<h4>Archives</h4>'));
                $archives.append(this.genArchives(archives));
            });
    }

    genArchives(archives) {
        let $archives = $('<ol class="list-unstyled"></ol>');
        for (let archive of archives) {
            let $archive = $(`<li><a href="#">${this.intToMonth[archive.month]} ${archive.year}</a></li>`);
            $archives.append($archive);
        }
        return $archives;
    }

}

let blog = new Blog();

$(document).ready(() => {
    location.hash = '#home';
});

