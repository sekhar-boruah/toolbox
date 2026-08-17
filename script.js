/* =====================================================
   TOOLBOX - IMAGE TOOLS
===================================================== */


/* =====================================================
   NAVIGATION
===================================================== */

function openTool(tool) {

    document.getElementById("home").style.display = "none";

    document.querySelectorAll(".tool-page").forEach(page => {
        page.style.display = "none";
    });

    document.getElementById(tool).style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showHome() {

    document.getElementById("home").style.display = "block";

    document.querySelectorAll(".tool-page").forEach(page => {
        page.style.display = "none";
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   IMAGE COMPRESSOR
===================================================== */

let compressFile = null;

const compressInput =
    document.getElementById("compressInput");

const compressPreview =
    document.getElementById("compressPreview");

const compressControls =
    document.getElementById("compressControls");

const sizeSlider =
    document.getElementById("sizeSlider");

const targetValue =
    document.getElementById("targetValue");


compressInput.addEventListener("change", function () {

    compressFile = this.files[0];

    if (!compressFile) return;

    compressPreview.src =
        URL.createObjectURL(compressFile);

    compressPreview.style.display = "block";

    compressControls.hidden = false;

    document.getElementById("compressResult")
        .style.display = "none";
});


sizeSlider.addEventListener("input", function () {

    targetValue.textContent =
        this.value + " KB";

    document.querySelectorAll(".quick-size")
        .forEach(button => {
            button.classList.remove("active");
        });
});


document.querySelectorAll(".quick-size")
    .forEach(button => {

        button.addEventListener("click", function () {

            const size =
                parseInt(this.dataset.size);

            sizeSlider.value = size;

            targetValue.textContent =
                size + " KB";

            document.querySelectorAll(".quick-size")
                .forEach(btn => {
                    btn.classList.remove("active");
                });

            this.classList.add("active");
        });
    });


async function compressImage() {

    if (!compressFile) {
        alert("Please choose an image first.");
        return;
    }

    const targetKB =
        parseInt(sizeSlider.value);

    const image = new Image();

    image.src =
        URL.createObjectURL(compressFile);

    await new Promise(resolve => {
        image.onload = resolve;
    });

    let canvas =
        document.createElement("canvas");

    canvas.width = image.width;
    canvas.height = image.height;

    let ctx =
        canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);

    let quality = .92;
    let blob;

    for (let i = 0; i < 15; i++) {

        blob = await canvasToBlob(
            canvas,
            quality
        );

        if (blob.size / 1024 <= targetKB) {
            break;
        }

        quality -= .06;

        if (quality < .05) {
            quality = .05;
        }
    }


    let attempts = 0;

    while (
        blob.size / 1024 > targetKB &&
        attempts < 10
    ) {

        canvas.width =
            Math.round(canvas.width * .85);

        canvas.height =
            Math.round(canvas.height * .85);

        ctx = canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
        );

        blob = await canvasToBlob(
            canvas,
            .75
        );

        attempts++;
    }


    const url =
        URL.createObjectURL(blob);

    const originalKB =
        (compressFile.size / 1024).toFixed(1);

    const newKB =
        (blob.size / 1024).toFixed(1);

    const reduction =
        Math.max(
            0,
            100 -
            (blob.size / compressFile.size * 100)
        ).toFixed(0);


    const result =
        document.getElementById(
            "compressResult"
        );

    result.style.display = "block";

    result.innerHTML = `
        <strong>✓ Image Ready</strong>
        <br><br>
        Original: ${originalKB} KB
        <br>
        New size: ${newKB} KB
        <br>
        Reduced: ${reduction}%
        <br><br>

        <a href="${url}" download="compressed-image.jpg">
            <button class="primary">
                Download Image
            </button>
        </a>
    `;

    result.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function canvasToBlob(canvas, quality) {

    return new Promise(resolve => {

        canvas.toBlob(
            resolve,
            "image/jpeg",
            quality
        );

    });
}


/* =====================================================
   IMAGE RESIZER
===================================================== */

let resizeFile = null;

let originalResizeWidth = 0;
let originalResizeHeight = 0;

let ratioLocked = true;


const resizeInput =
    document.getElementById("resizeInput");

const resizeWidth =
    document.getElementById("resizeWidth");

const resizeHeight =
    document.getElementById("resizeHeight");

const resizeUnit =
    document.getElementById("resizeUnit");

const resizeDpi =
    document.getElementById("resizeDpi");


resizeInput.addEventListener("change", function () {

    resizeFile = this.files[0];

    if (!resizeFile) return;

    const image = new Image();

    image.onload = function () {

        originalResizeWidth = image.width;
        originalResizeHeight = image.height;

        resizeWidth.value = image.width;
        resizeHeight.value = image.height;

        document.getElementById(
            "resizePreview"
        ).src = image.src;

        document.getElementById(
            "resizeWorkspace"
        ).hidden = false;

        updateResizeMeta();
    };

    image.src =
        URL.createObjectURL(resizeFile);
});


function toggleRatioLock() {

    ratioLocked = !ratioLocked;

    const button =
        document.getElementById("ratioLock");

    button.classList.toggle(
        "active",
        ratioLocked
    );

    button.textContent =
        ratioLocked ? "🔒" : "🔓";
}


resizeWidth.addEventListener("input", function () {

    if (!ratioLocked) {
        updateResizeMeta();
        return;
    }

    const width =
        parseFloat(this.value);

    if (!width || !originalResizeWidth) return;

    const ratio =
        originalResizeHeight /
        originalResizeWidth;

    resizeHeight.value =
        Math.round(width * ratio);

    updateResizeMeta();
});


resizeHeight.addEventListener("input", function () {

    if (!ratioLocked) {
        updateResizeMeta();
        return;
    }

    const height =
        parseFloat(this.value);

    if (!height || !originalResizeHeight) return;

    const ratio =
        originalResizeWidth /
        originalResizeHeight;

    resizeWidth.value =
        Math.round(height * ratio);

    updateResizeMeta();
});


resizeUnit.addEventListener(
    "change",
    updateResizeMeta
);

resizeDpi.addEventListener(
    "change",
    updateResizeMeta
);


function setResizePreset(width, height) {

    resizeUnit.value = "px";

    resizeWidth.value = width;
    resizeHeight.value = height;

    ratioLocked = false;

    const lock =
        document.getElementById("ratioLock");

    lock.classList.remove("active");
    lock.textContent = "🔓";

    updateResizeMeta();
}


function pixelsToUnit(px, unit, dpi) {

    if (unit === "px") {
        return px;
    }

    if (unit === "in") {
        return px / dpi;
    }

    if (unit === "cm") {
        return px / dpi * 2.54;
    }

    if (unit === "mm") {
        return px / dpi * 25.4;
    }

    return px;
}


function unitToPixels(value, unit, dpi) {

    if (unit === "px") {
        return value;
    }

    if (unit === "in") {
        return value * dpi;
    }

    if (unit === "cm") {
        return value / 2.54 * dpi;
    }

    if (unit === "mm") {
        return value / 25.4 * dpi;
    }

    return value;
}


function updateResizeMeta() {

    if (!originalResizeWidth) return;

    const unit =
        resizeUnit.value;

    const dpi =
        parseInt(resizeDpi.value);

    const width =
        parseFloat(resizeWidth.value) || 0;

    const height =
        parseFloat(resizeHeight.value) || 0;

    if (!width || !height) return;

    const displayWidth =
        pixelsToUnit(
            width,
            unit,
            dpi
        );

    const displayHeight =
        pixelsToUnit(
            height,
            unit,
            dpi
        );


    document.getElementById(
        "resizeMeta"
    ).textContent =
        `Output: ${displayWidth.toFixed(2)} × ` +
        `${displayHeight.toFixed(2)} ${unit} ` +
        `(${Math.round(width)} × ${Math.round(height)} px)`;
}


function resizeImage() {

    if (!resizeFile) {

        alert(
            "Please choose an image first."
        );

        return;
    }


    const unit =
        resizeUnit.value;

    const dpi =
        parseInt(resizeDpi.value);


    let width =
        parseFloat(resizeWidth.value);

    let height =
        parseFloat(resizeHeight.value);


    if (!width || !height) {

        alert(
            "Please enter valid dimensions."
        );

        return;
    }


    /*
       Convert physical dimensions
       into actual pixels.
    */

    width =
        Math.round(
            unitToPixels(
                width,
                unit,
                dpi
            )
        );

    height =
        Math.round(
            unitToPixels(
                height,
                unit,
                dpi
            )
        );


    if (width < 1 || height < 1) {

        alert(
            "Dimensions are too small."
        );

        return;
    }


    const image =
        new Image();


    image.onload = function () {

        const canvas =
            document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            image,
            0,
            0,
            width,
            height
        );


        canvas.toBlob(
            function (blob) {

                const url =
                    URL.createObjectURL(blob);

                const result =
                    document.getElementById(
                        "resizeResult"
                    );

                result.style.display = "block";

                result.innerHTML = `
                    <strong>✓ Image Resized</strong>
                    <br><br>

                    ${width} × ${height} pixels
                    <br><br>

                    <a
                        href="${url}"
                        download="resized-image.jpg">

                        <button class="primary">
                            Download Image
                        </button>

                    </a>
                `;

                result.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },
            "image/jpeg",
            .92
        );
    };


    image.src =
        URL.createObjectURL(resizeFile);
}


/* =====================================================
   IMAGE CONVERTER
===================================================== */

let convertFile = null;


document.getElementById("convertInput")
    .addEventListener("change", function () {

        convertFile = this.files[0];

        if (!convertFile) return;

        const preview =
            document.getElementById(
                "convertPreview"
            );

        preview.src =
            URL.createObjectURL(convertFile);

        preview.style.display = "block";

        document.getElementById(
            "convertControls"
        ).hidden = false;

        document.getElementById(
            "convertResult"
        ).style.display = "none";
    });


function convertImage() {

    if (!convertFile) {

        alert(
            "Please choose an image first."
        );

        return;
    }


    const format =
        document.getElementById(
            "format"
        ).value;


    const image =
        new Image();


    image.onload = function () {

        const canvas =
            document.createElement("canvas");

        canvas.width =
            image.width;

        canvas.height =
            image.height;


        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            image,
            0,
            0
        );


        canvas.toBlob(
            function (blob) {

                const url =
                    URL.createObjectURL(blob);

                let extension = "jpg";

                if (format === "image/png") {
                    extension = "png";
                }

                if (format === "image/webp") {
                    extension = "webp";
                }


                const result =
                    document.getElementById(
                        "convertResult"
                    );

                result.style.display = "block";

                result.innerHTML = `
                    <strong>✓ Conversion Complete</strong>
                    <br><br>

                    <a
                        href="${url}"
                        download="converted-image.${extension}">

                        <button class="primary">
                            Download ${extension.toUpperCase()}
                        </button>

                    </a>
                `;

            },
            format,
            .92
        );
    };


    image.src =
        URL.createObjectURL(convertFile);
}


/* =====================================================
   IMAGE CROPPER
===================================================== */

let cropFile = null;

let cropImageElement = null;

let cropBox = null;

let cropStage = null;

let cropState = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};

let cropInteraction = null;

let cropAspect = null;


/* FILE */

document.getElementById("cropInput")
    .addEventListener("change", function () {

        cropFile = this.files[0];

        if (!cropFile) return;

        cropImageElement =
            document.getElementById(
                "cropImage"
            );

        cropImageElement.onload =
            function () {

                setupCropper();
            };


        cropImageElement.src =
            URL.createObjectURL(
                cropFile
            );
    });


function setupCropper() {

    document.getElementById(
        "cropWorkspace"
    ).hidden = false;


    cropStage =
        document.getElementById(
            "cropStage"
        );

    cropBox =
        document.getElementById(
            "cropBox"
        );


    /*
       Start with an 80% crop box.
    */

    const stageWidth =
        cropStage.clientWidth;

    const stageHeight =
        cropStage.clientHeight;


    cropState.width =
        stageWidth * .8;

    cropState.height =
        stageHeight * .8;

    cropState.x =
        (stageWidth - cropState.width) / 2;

    cropState.y =
        (stageHeight - cropState.height) / 2;


    renderCropBox();

    updateCropInfo();
}


function renderCropBox() {

    cropBox.style.left =
        cropState.x + "px";

    cropBox.style.top =
        cropState.y + "px";

    cropBox.style.width =
        cropState.width + "px";

    cropBox.style.height =
        cropState.height + "px";
}


/* =====================================================
   CROP DRAGGING
===================================================== */

cropBox.addEventListener(
    "pointerdown",
    startCropInteraction
);


document.querySelectorAll(
    ".handle"
).forEach(handle => {

    handle.addEventListener(
        "pointerdown",
        startCropInteraction
    );
});


function startCropInteraction(event) {

    event.preventDefault();

    const handle =
        event.target.dataset.handle ||
        "move";


    cropInteraction = {

        type: handle,

        startX: event.clientX,

        startY: event.clientY,

        originalX: cropState.x,

        originalY: cropState.y,

        originalWidth: cropState.width,

        originalHeight: cropState.height

    };


    document.addEventListener(
        "pointermove",
        moveCropInteraction
    );

    document.addEventListener(
        "pointerup",
        stopCropInteraction,
        { once: true }
    );
}


function moveCropInteraction(event) {

    if (!cropInteraction) return;


    const dx =
        event.clientX -
        cropInteraction.startX;

    const dy =
        event.clientY -
        cropInteraction.startY;


    const type =
        cropInteraction.type;


    const stageWidth =
        cropStage.clientWidth;

    const stageHeight =
        cropStage.clientHeight;


    if (type === "move") {

        cropState.x =
            cropInteraction.originalX + dx;

        cropState.y =
            cropInteraction.originalY + dy;


        cropState.x =
            Math.max(
                0,
                Math.min(
                    cropState.x,
                    stageWidth -
                    cropState.width
                )
            );


        cropState.y =
            Math.max(
                0,
                Math.min(
                    cropState.y,
                    stageHeight -
                    cropState.height
                )
            );
    }

    else {

        resizeCropBox(
            type,
            dx,
            dy,
            stageWidth,
            stageHeight
        );
    }


    renderCropBox();

    updateCropInfo();
}


function resizeCropBox(
    type,
    dx,
    dy,
    stageWidth,
    stageHeight
) {

    const minSize = 30;


    let x =
        cropInteraction.originalX;

    let y =
        cropInteraction.originalY;

    let width =
        cropInteraction.originalWidth;

    let height =
        cropInteraction.originalHeight;


    /*
       LEFT
    */

    if (
        type.includes("w")
    ) {

        const newX =
            Math.max(
                0,
                Math.min(
                    x + dx,
                    x + width - minSize
                )
            );

        width -=
            newX - x;

        x = newX;
    }


    /*
       RIGHT
    */

    if (
        type.includes("e")
    ) {

        width =
            Math.max(
                minSize,
                Math.min(
                    width + dx,
                    stageWidth - x
                )
            );
    }


    /*
       TOP
    */

    if (
        type.includes("n")
    ) {

        const newY =
            Math.max(
                0,
                Math.min(
                    y + dy,
                    y + height - minSize
                )
            );

        height -=
            newY - y;

        y = newY;
    }


    /*
       BOTTOM
    */

    if (
        type.includes("s")
    ) {

        height =
            Math.max(
                minSize,
                Math.min(
                    height + dy,
                    stageHeight - y
                )
            );
    }


    /*
       ASPECT RATIO
    */

    if (cropAspect) {

        const originalWidth =
            width;

        const originalHeight =
            height;


        if (
            type.includes("e") ||
            type.includes("w")
        ) {

            height =
                width / cropAspect;

        }
        else {

            width =
                height * cropAspect;
        }


        /*
           Keep crop inside stage.
        */

        if (
            x + width > stageWidth
        ) {

            width =
                stageWidth - x;

            height =
                width / cropAspect;
        }


        if (
            y + height > stageHeight
        ) {

            height =
                stageHeight - y;

            width =
                height * cropAspect;
        }


        /*
           For corner dragging,
           use a balanced ratio.
        */

        if (
            type.length === 2
        ) {

            const deltaWidth =
                Math.abs(
                    originalWidth -
                    cropInteraction.originalWidth
                );

            const deltaHeight =
                Math.abs(
                    originalHeight -
                    cropInteraction.originalHeight
                );

            if (deltaHeight > deltaWidth) {

                height =
                    Math.max(
                        minSize,
                        height
                    );

                width =
                    height *
                    cropAspect;

            }
        }
    }


    cropState.x = x;
    cropState.y = y;

    cropState.width = width;
    cropState.height = height;
}


function stopCropInteraction() {

    cropInteraction = null;

    document.removeEventListener(
        "pointermove",
        moveCropInteraction
    );
}


/* =====================================================
   CROP ASPECT RATIO
===================================================== */

document.querySelectorAll(
    ".aspect"
).forEach(button => {

    button.addEventListener(
        "click",
        function () {

            document.querySelectorAll(
                ".aspect"
            ).forEach(btn => {
                btn.classList.remove(
                    "active"
                );
            });

            this.classList.add(
                "active"
            );


            const value =
                this.dataset.ratio;


            if (value === "free") {

                cropAspect = null;

                return;
            }


            cropAspect =
                parseFloat(value);


            applyAspectRatio();
        }
    );
});


function applyAspectRatio() {

    if (!cropAspect) return;


    let width =
        cropState.width;

    let height =
        width / cropAspect;


    const stageWidth =
        cropStage.clientWidth;

    const stageHeight =
        cropStage.clientHeight;


    if (
        height >
        stageHeight
    ) {

        height =
            stageHeight;

        width =
            height *
            cropAspect;
    }


    cropState.width =
        width;

    cropState.height =
        height;


    cropState.x =
        Math.min(
            cropState.x,
            stageWidth - width
        );


    cropState.y =
        Math.min(
            cropState.y,
            stageHeight - height
        );


    renderCropBox();

    updateCropInfo();
}


/* =====================================================
   CROP INFORMATION
===================================================== */

function updateCropInfo() {

    if (!cropImageElement) return;


    const naturalWidth =
        cropImageElement.naturalWidth;

    const naturalHeight =
        cropImageElement.naturalHeight;


    const displayWidth =
        cropImageElement.clientWidth;

    const displayHeight =
        cropImageElement.clientHeight;


    if (!displayWidth || !displayHeight) {
        return;
    }


    const scaleX =
        naturalWidth /
        displayWidth;

    const scaleY =
        naturalHeight /
        displayHeight;


    const actualWidth =
        Math.round(
            cropState.width *
            scaleX
        );

    const actualHeight =
        Math.round(
            cropState.height *
            scaleY
        );


    document.getElementById(
        "cropDimensions"
    ).textContent =
        `${actualWidth} × ${actualHeight} px`;
}


/* =====================================================
   CROP IMAGE
===================================================== */

function cropImage() {

    if (!cropFile || !cropImageElement) {

        alert(
            "Please choose an image first."
        );

        return;
    }


    const naturalWidth =
        cropImageElement.naturalWidth;

    const naturalHeight =
        cropImageElement.naturalHeight;


    const displayWidth =
        cropImageElement.clientWidth;

    const displayHeight =
        cropImageElement.clientHeight;


    const scaleX =
        naturalWidth /
        displayWidth;

    const scaleY =
        naturalHeight /
        displayHeight;


    const sourceX =
        cropState.x *
        scaleX;

    const sourceY =
        cropState.y *
        scaleY;

    const sourceWidth =
        cropState.width *
        scaleX;

    const sourceHeight =
        cropState.height *
        scaleY;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        Math.round(sourceWidth);

    canvas.height =
        Math.round(sourceHeight);


    const ctx =
        canvas.getContext("2d");


    ctx.drawImage(
        cropImageElement,

        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,

        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(
        function (blob) {

            const url =
                URL.createObjectURL(blob);


            const result =
                document.getElementById(
                    "cropResult"
                );


            result.style.display =
                "block";


            result.innerHTML = `

                <strong>
                    ✓ Crop Complete
                </strong>

                <br><br>

                ${canvas.width}
                ×
                ${canvas.height}
                pixels

                <br><br>

                <a
                    href="${url}"
                    download="cropped-image.jpg">

                    <button class="primary">
                        Download Cropped Image
                    </button>

                </a>
            `;


            result.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        },
        "image/jpeg",
        .92
    );
}


/* =====================================================
   IMAGE INFORMATION
===================================================== */

document.getElementById("infoInput")
    .addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;


        const image = new Image();


        image.onload = function () {

            const sizeKB =
                (file.size / 1024).toFixed(2);


            const result =
                document.getElementById(
                    "infoResult"
                );


            result.style.display =
                "block";


            result.innerHTML = `

                <strong>
                    Image Information
                </strong>

                <br><br>

                File name:
                ${escapeHTML(file.name)}

                <br>

                Format:
                ${file.type || "Unknown"}

                <br>

                File size:
                ${sizeKB} KB

                <br>

                Dimensions:
                ${image.width}
                ×
                ${image.height}
                px

                <br>

                Aspect ratio:
                ${(image.width / image.height).toFixed(2)}

            `;
        };


        image.src =
            URL.createObjectURL(file);
    });


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}