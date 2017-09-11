class Blog {
    constructor() {
        this.host = "https://blog.thisishzr.me/api/v1"

        this.page = {
            index: 0,
            sizePerPage: 5,
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
            .then(this.getPosts())
            .then(this.showPosts())
            .then(this.getArchives())
            .then(this.showArchives())
    }

    countPost() {
        return fetch(`${this.host}/posts/count`)
            .then(response => {
                if (!response.ok) {
                    return new Error(response.statusText)
                }
                return response.json()
            }).then((data) => {
                this.page.count = Math.ceil(data.count / this.page.sizePerPage)
            })
    }

    getPosts() {
        let skip = this.page.index * this.page.sizePerPage
        let limit = this.page.sizePerPage
        const url = `${this.host}/posts?skip=${skip}&limit=${limit}`
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    return new Error(response.statusText)
                }
                return response.json()
            })
    }

    showPosts(data) {
        console.log(data)
        let $main = document.getElementById('main')
        this.removeChildren($main)
        let $posts = document.createElement('div')
        for (let post of data.posts) {
            $posts.appendChild(this.genPost(post))
        }
        $main.appendChild($posts)
        let $button = this.genPageButton()
        $main.appendChild($button)
    }

    genPost(post) {
        let $post = document.createElement('div')
        $post.classList.add("blog-post")

        let $title = document.createElement('h2')
        $title.innerHTML = post.title;
        $title.classList.add("blog-post-title")
        $post.appendChild($title)

        let $meta = document.createElement('p')
        $meta.classList.add('blog-post-meta')
        let date = new Date(1000 * post.created_at)
        $meta.innerHTML = `${date.toLocaleString()} by ${post.created_by.email}`
        $post.appendChild($meta)

        let $body = document.createElement('div')
        $body.innerHTML = post.body
        $post.appendChild($body)

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

    postLogin() {
        const url = `${this.host}/users/login`
        let headers = new Headers({
            'Content-Type': 'application/json',
        })
        let req = new Request(url, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify({
                email: document.getElementById('inputEmail').value,
                password: document.getElementById('inputPassword').value,
            }),
            headers: headers,
        })
        return fetch(req)
            .then(response => {
                if (!response.ok) {
                    return new Error(response.statusText)
                }
                return response.json()
            }).then(data => {
                localStorage.setItem('token', data.token);
            })
    }

    postPosts() {
        const url = `${this.host}/posts`;
        let headers = new Headers({
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
        })
        let postBody = JSON.stringify({
            title: document.getElementById('title').innerHTML,
            body: document.getElementById('body').innerHTML,
        })
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    return new Error(response.statusText)
                }
                return response.json()
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
                return this.postPosts()
                    .then(() => {
                        location.hash = '#home';
                    });
            }
            $post.appendChild($btn)

            $main.appendChild($post)

            return resolve();
        });
    }

    getArchives() {
        const url = this.host + '/archives';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    return new Error(response.statusText)
                }
                return response.json()
            })
    }

    showArchives() {
        return this.getArchives()
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
        let $archives = document.createElement('ul')
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
    location.hash = '#home'
    let $loginBtn = document.getElementById('login-btn')
    $loginBtn.onclick = () => {
        $email = document.getElementById('inputEmail')
        $password = document.getElementById('inputPassword')
        blog.postLogin()
            .then(() => {
                location.hash = "#home"
            })
    }
}