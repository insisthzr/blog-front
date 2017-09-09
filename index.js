class Blog {
    constructor() {
        this.host = "https://blog.thisishzr.me/api/v1"

        this.page = {
            index: 0,
            size: 5,
            count: 0,
        }

        this.intToMonth = {
            1: 'January',
            2: 'February',
            3: 'March',
            4: 'April',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'November',
            12: 'December'
        }

        this.label = ''
    }

    init() {}

    removeChildren(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild)
        }
    }

    changeURL() {
        let $label = document.getElementById(this.label)
        if ($label) {
            $label.classList.remove('active')
        }
        let url = location.hash
        url = url.replace('#', '')
        document.getElementById(url).classList.add('active')
        this.label = url
        switch (url) {
            case 'home':
                this.page.index = 0
                return this.showMain()
                break
            case 'login':
                return this.showLogin()
                break
            case 'create':
                if (!localStorage.getItem('token')) {
                    return
                }
                return this.showCreatePost()
                break
            default:
        }
    }


    showMain() {
        return this.countPost()
            .then(this.showPosts())
            .then(this.showArchives())
    }

    countPost() {
        return new Promise((resolve, reject) => {
            const url = `${this.host}/posts/count`;
            $.getJSON(url, (data, status) => {
                if (status !== 'success') {
                    return reject()
                }
                this.page.count = Math.ceil(data.count / this.page.size)
                return resolve()
            })
        })
    }

    showPosts() {
        return new Promise((resolve, reject) => {
            let skip = this.page.index * this.page.size
            let limit = this.page.size
            const url = `${this.host}/posts?skip=${skip}&limit=${limit}`
            $.getJSON(url, (data, status) => {
                if (status !== 'success') {
                    return reject();
                }
                let $main = document.getElementById('main')
                this.removeChildren($main)
                let $posts = document.createElement('div')
                for (let post of data.posts) {
                    $posts.appendChild(this.genPost(post))
                }
                $main.appendChild($posts)
                let $button = this.genPageButton()
                $main.appendChild($button)
                return resolve()
            })
        })
    }

    genPost(post) {
        let $title = document.createElement('h2')
        $title.innerHTML = post.title;
        $title.classList.add("blog-post-title")

        let $meta = document.createElement('p')
        $meta.classList.add('blog-post-meta')
        let date = new Date(1000 * post.created_at)
        $meta.innerHTML = `${date.toLocaleString()} by ${post.created_by.email}`
        let $body = document.createElement('div')
        $body.innerHTML = post.body

        let $post = document.createElement('div')
        $post.classList.add("blog-post")
        $post.appendChild($title)
        $post.appendChild($body)
        $post.appendChild($meta)
        return $post;
    }

    genPageButton() {
        let $nav = document.createElement('nav')
        $nav.classList.add('blog-pagination')
        let $prev = document.createElement('a')
        $prev.classList.add('btn', 'btn-outline-primary')
        $prev.innerHTML = 'prev'
        if (this.page.index === 0) {
            $prev.classList.add('disabled')
        }
        $prev.onclick = () => {
            this.page.index--;
            if (this.page.index < 0) {
                this.page.index = 0;
            }
            return this.showMain()
        }
        let $next = document.createElement('a')
        $next.classList.add('btn', 'btn-outline-primary')
        $next.innerHTML = 'next'
        if (this.page.index === this.page.count - 1) {
            $next.classList.add('disabled')
        }
        $next.onclick = () => {
            this.page.index++;
            if (this.page.index >= this.page.count) {
                this.page.index = this.page.count - 1
            }
            return this.showMain()
        }
        $nav.appendChild($prev)
        $nav.appendChild($next)
        return $nav
    }

    login() {
        return new Promise((resolve, reject) => {
            const url = `${this.host}/users/login`
            let postBody = JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            })
            $.ajax({
                type: 'POST',
                url: url,
                data: postBody,
                success: (data, status) => {
                    if (status !== 'success') {
                        return reject();
                    }
                    localStorage.setItem('token', data.token);
                    return resolve();
                },
                contentType: "application/json",
            })
        })
    }

    showLogin() {
        return new Promise((resolve, reject) => {
            let $main = document.getElementById('main')
            let $form = this.genLogin()
            this.removeChildren($main)
            $main.appendChild($form)
            return resolve()
        });
    }

    genLogin() {
        let $container = document.createElement('div')
        $container.classList.add('login-container')

        let $form = document.createElement('form')
        $form.classList.add('form-signin')

        let $header = document.createElement('h2')
        $header.classList.add('form-signin-heading')
        $header.innerHTML = 'Please sign in'
        $form.appendChild($header)

        let $email = document.createElement('input')
        $email.id = 'email'
        $email.placeholder = 'Email address'
        $email.classList.add('form-control')
        $form.appendChild($email)

        let $password = document.createElement('input')
        $password.id = 'password'
        $password.type, 'password'
        $password.placeholder = 'Password'
        $password.classList.add('form-control')
        $form.appendChild($password)

        let $submit = document.createElement('button')
        $submit.classList.add('btn', 'btn-lg', 'btn-primary', 'btn-block')
        $submit.type = 'submit'
        $submit.innerHTML = 'Sign in'
        $submit.onclick = () => {
            this.login()
                .then(() => {
                    location.hash = '#home';
                });
        }
        $form.appendChild($submit);

        $container.appendChild($form)

        return $container;
    }

    fetchPosts() {
        return new Promise((resolve, reject) => {
            const url = `${this.host}/posts`;
            let postBody = JSON.stringify({
                title: document.getElementById('title').innerHTML,
                body: document.getElementById('body').innerHTML,
            })
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
            })
        })
    }

    showCreatePost() {
        return new Promise((resolve, reject) => {
            let $main = document.getElementById('main')
            this.removeChildren($main)

            let $post = document.createElement('div')
            $post.id = 'login'
            $post.classList.add('input-group')

            let $title = document.createElement('input')
            $title.id = 'title'
            $title.type = 'text'
            $title.placeholder = 'Title'
            $title.classList.add('form-control')
            $post.appendChild($title)

            let $body = document.createElement('textarea')
            $body.id = 'body'
            $body.classList.add('form-control')
            $body.rows = '10'
            $body.placeholder = 'Body'
            $post.appendChild($body)

            let $btn = document.createElement('button')
            $btn.type = 'button'
            $btn.classList.add('btn', 'btn-default')
            $btn.innerHTML = 'Submit'
            $btn.onclick = () => {
                return this.fetchPosts()
                    .then(() => {
                        location.hash = '#home';
                    });
            }
            $post.appendChild($btn)

            $main.appendChild($post)

            return resolve();
        });
    }

    fetchArchives() {
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
            })
        })
    }

    showArchives() {
        return this.fetchArchives()
            .then((archives) => {
                let $archives = document.getElementById('archives')
                this.removeChildren($archives)
                let $header = document.createElement('h4')
                $header.innerHTML = 'Archives'
                $archives.appendChild($header)
                $archives.appendChild(this.genArchives(archives));
            });
    }

    genArchives(archives) {
        let $archives = document.createElement('ol')
        $archives.classList.add('list-unstyled"')
        for (let archive of archives) {
            let $archive = document.createElement('li')
            $archive.innerHTML = `${this.intToMonth[archive.month]} ${archive.year}`
            $archives.appendChild($archive);
        }
        return $archives;
    }

}

let blog = new Blog();

window.onload = () => {
    location.hash = '#home';
};