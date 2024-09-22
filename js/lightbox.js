class Lightbox {
    constructor(HTMLElement) {
        // HTML properties
        this.elt = HTMLElement;
        this.wallpaper = this.elt.find('.lbx-image>img');
        this.userInterface = this.elt.find('.interface');
        this.icons = {
            close: this.elt.find('[alt=close]'),
            fullscreen: this.elt.find('[alt=fullscreen]'),
            next: this.elt.find('[alt=next]'),
            prev: this.elt.find('[alt=previous]'),
            expand: this.elt.find('[alt=expand]')
        };
        this.labels = {
            gallery: this.elt.find('.lbx-gallery'),
            counter: this.elt.find('.lbx-counter>.counter'),
            total: this.elt.find('.lbx-counter>.total'),
            title: this.elt.find('.lbx-img-title'),
            descr: this.elt.find('.lbx-img-descr'),
            tags: this.elt.find('.lbx-img-tags')
        };

        // js properties
        this.active = false;
        this.UIVisible = true;
        this.slideshow = {
            galleryName: "",
            images: [],
            activeIndex: 0
        };

        // UI functions
        this.elt.find('.outer-container').on('click', e => {
            e.stopPropagation(); // stop click propagation on last layer
            if (!this.UIVisible) this.icons.fullscreen.click();
        });
        this.elt.on('click', e => this.close());
        this.icons.close.on('click', e => this.close());
        this.icons.next.on('click', e => this.next());
        this.icons.prev.on('click', e => this.previous());
        this.icons.expand.on('click', e => this.expandText());
        this.icons.fullscreen.on('click', e => {
            e.stopPropagation();
            if (this.UIVisible) {
                this.fullscreen(true);
            } else {
                this.fullscreen(false);
            }
        });

        // keyboard inputs
        $(document).on('keyup', e => {
            if (this.active) {
                switch (e.key) {
                    case 'ArrowLeft':
                        this.icons.prev.click();
                        break;
                    case 'ArrowRight':
                        this.icons.next.click();
                        break;
                    case 'Escape':
                        this.icons.close.click();
                        break;
                    case 'f':
                        this.icons.fullscreen.click();
                        break;
                }
            }
        });
    }

    open(figureElement, options = {}) {
        let label = $(figureElement).closest('.year').find('label');
        let parent = $(figureElement).closest('.row');
        let collection = parent.find('figure');

        this.slideshow.galleryName = label.text();

        this.slideshow.images = collection.map((i, fig) => {
            return new LightboxImage($(fig), { THUMB_SUFFIX: options.THUMB_SUFFIX });
        }).toArray();

        this.slideshow.activeIndex = collection.index(figureElement);

        this.fullscreen(false);
        this.active = true;
        $(this.elt).addClass('active');
        this.updateShownImage();
    }

    close() {
        $(this.elt).removeClass('active');
        this.active = false;
    }

    previous() {
        var index = this.slideshow.activeIndex;
        var len = this.slideshow.images.length;
        index--;
        if (index < 0) index = len - 1;
        this.slideshow.activeIndex = index;

        this.updateShownImage();
    }

    next() {
        var index = this.slideshow.activeIndex;
        var len = this.slideshow.images.length;
        index++;
        this.slideshow.activeIndex = index % len;

        this.updateShownImage();
    }

    fullscreen(boolean) {
        if (boolean) {
            this.userInterface.addClass('hidden');
            this.UIVisible = false;
        } else {
            this.userInterface.removeClass('hidden');
            this.UIVisible = true;
        }
    }

    updateShownImage() {
        this.labels.gallery.text(this.slideshow.galleryName);
        this.labels.counter.text(this.slideshow.activeIndex + 1);
        this.labels.total.text(this.slideshow.images.length);

        let targetImg = this.slideshow.images[this.slideshow.activeIndex];
        this.labels.title.text(targetImg.title);
        this.labels.descr.text(targetImg.description);

        this.labels.tags.empty();
        targetImg.tags.forEach(tag => {
            let t = $('<span>').text(tag);
            this.labels.tags.append(t);
        });

        this.wallpaper.attr('src', targetImg.path);
        this.elt.find('.outer-container').css("--aspect", targetImg.aspectRatio);
    }

    expandText() {
        this.elt.find('.interface>footer').toggleClass('open');
    }
}

class LightboxImage {
    constructor(HTMLFigure, options = {}) {
        this.elt = HTMLFigure;
        this.title = this.elt.find('.title').text();
        this.description = this.elt.find('.description').text();
        this.tags = $.map(this.elt.find('.tags>span'), s => s.innerText);

        this.image = new Image();
        this.path = this.elt.find('img').attr('src');
        this.path = this.path.replace(options.THUMB_SUFFIX, "");
        this.image.src = this.path;

        $(this.image).on('load', () => {
            this.width = this.image.naturalWidth;
            this.height = this.image.naturalHeight;
            this.aspectRatio = this.width / this.height;
        });
    }
}

const lightbox = new Lightbox($('#lightbox'));
// lightbox.open();
// $(document).on('keyup', e => console.log(e.key))