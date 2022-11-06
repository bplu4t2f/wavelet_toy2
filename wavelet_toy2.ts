document.addEventListener("DOMContentLoaded", Init);

function Init()
{
    let FileInput = document.getElementById("file") as HTMLInputElement;
    FileInput.addEventListener("change", HandleFileUploaded);
    let ImgPreview = document.getElementById("natural-preview") as HTMLImageElement;
    ImgPreview.addEventListener("load", HandleImageLoaded);

    let target_size = 256;

    function HandleFileUploaded()
    {
        let file = GetFileFromFileInput(FileInput);
        if (!file) return;

        ImgPreview.width = target_size;
        ImgPreview.height = target_size;

        let url = URL.createObjectURL(file);
        ImgPreview.src = url;
    }
    
    // Initial update - in case there's already something in the file picker on page load.
    HandleFileUploaded();

    function HandleImageLoaded()
    {
        let natural_w = ImgPreview.naturalWidth;
        let natural_h = ImgPreview.naturalHeight;

        // Transform the image to a fixed size by drawing it to a canvas.
        let ImageData : ImageData;
        {
            let canvas = document.getElementById("resized-preview") as HTMLCanvasElement;
            canvas.width = target_size;
            canvas.height = target_size;
            let c2d = canvas.getContext("2d")!;
            // TODO find a way to improve downsampling
            c2d.imageSmoothingEnabled = true;
            c2d.imageSmoothingQuality = "high";
            c2d.drawImage(ImgPreview, 0, 0, natural_w, natural_h, 0, 0, target_size, target_size);
            ImageData = c2d.getImageData(0, 0, target_size, target_size);
        }

        // ========================================================================================================================
        // ========================================================================================================================
        
        // Transform flow 1 (default): YIQ + pass-minor weighted + stripped coefficients

        {
            let container = CreateFlowContainer("YIQ + pass-minor weighted + stripped coefficients");
            AddCanvas(container, "Source", ImageData);

            // RGB->YIQ
            let ImageYIQ = RGB_to_YIQ(ImageData);
            AddCanvas(container, "YIQ", Visualize_YIQ(ImageYIQ));

            // transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                transform_2d_pass_minor_weighted(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Transformed (pass-minor weighted)", Visualize_Linear_FixedRange(ImageYIQ, 0.2));

            // Strip:
            StripInsignificantCoefficients(ImageYIQ, 40);
            AddCanvas(container, "Transformed Stripped", Visualize_Linear_FixedRange(ImageYIQ, 0.2));

            // Reverse transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                reverse_2d_pass_minor_weighted(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Stripped YIQ", Visualize_YIQ(ImageYIQ));

            // YIQ->RGB
            AddCanvas(container, "Stripped RGB", YIQ_to_RGB(ImageYIQ));
        }

        // ========================================================================================================================
        // ========================================================================================================================
        
        // Transform flow 2: YIQ + pass-minor weighted

        {
            let container = CreateFlowContainer("YIQ + pass-minor weighted (transform-reverse verification) OBVIOUSLY THERE'S A BUG IN HERE :(");
            AddCanvas(container, "Source", ImageData);

            // RGB->YIQ
            let ImageYIQ = RGB_to_YIQ(ImageData);
            AddCanvas(container, "YIQ", Visualize_YIQ(ImageYIQ));

            // transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                transform_2d_pass_minor_weighted(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Transformed (pass-minor weighted)", Visualize_Linear_FixedRange(ImageYIQ, 0.2));

            // Reverse transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                reverse_2d_pass_minor_weighted(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "YIQ", Visualize_YIQ(ImageYIQ));

            // YIQ->RGB
            AddCanvas(container, "RGB", YIQ_to_RGB(ImageYIQ));
        }

        // ========================================================================================================================
        // ========================================================================================================================
        
        // Transform flow 3: YIQ + pass-minor + stripped

        {
            let container = CreateFlowContainer("YIQ + pass-minor + stripped");
            AddCanvas(container, "Source", ImageData);

            // RGB->YIQ
            let ImageYIQ = RGB_to_YIQ(ImageData);
            AddCanvas(container, "YIQ", Visualize_YIQ(ImageYIQ));

            // transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                transform_2d_pass_minor(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Transformed (pass-minor weighted)", Visualize_Linear_FixedRange(ImageYIQ, 0.2));

            // Strip:
            StripInsignificantCoefficients(ImageYIQ, 40);
            AddCanvas(container, "Transformed Stripped", Visualize_Linear_FixedRange(ImageYIQ, 0.2));

            // Reverse transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                reverse_2d_pass_minor(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Stripped YIQ", Visualize_YIQ(ImageYIQ));

            // YIQ->RGB
            AddCanvas(container, "Stripped RGB", YIQ_to_RGB(ImageYIQ));
        }

        // ========================================================================================================================
        // ========================================================================================================================
        
        // Transform flow 4: YIQ + pass-minor

        {
            let container = CreateFlowContainer("YIQ + pass-minor (transform-reverse verification)");
            AddCanvas(container, "Source", ImageData);

            // RGB->YIQ
            let ImageYIQ = RGB_to_YIQ(ImageData);
            AddCanvas(container, "YIQ", Visualize_YIQ(ImageYIQ));

            // transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                transform_2d_pass_minor(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Transformed (pass-minor weighted)", Visualize_Linear_FixedRange(ImageYIQ, 0.2));

            // Reverse transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                reverse_2d_pass_minor(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Stripped YIQ", Visualize_YIQ(ImageYIQ));

            // YIQ->RGB
            AddCanvas(container, "Stripped RGB", YIQ_to_RGB(ImageYIQ));
        }

        // ========================================================================================================================
        // ========================================================================================================================
        
        // Transform flow 5: YIQ + pass-major (no reverse implemented)

        {
            let container = CreateFlowContainer("YIQ + pass-major (no reverse implemented)");
            AddCanvas(container, "Source", ImageData);

            // RGB->YIQ
            let ImageYIQ = RGB_to_YIQ(ImageData);
            AddCanvas(container, "YIQ", Visualize_YIQ(ImageYIQ));

            // transform:
            for (let c = 0; c < ImageYIQ.Channels.length; ++c)
            {
                transform_2d_pass_minor(ImageYIQ.Channels[c], ImageYIQ.Width, ImageYIQ.Height);
            }
            AddCanvas(container, "Transformed (pass-minor weighted)", Visualize_Linear_FixedRange(ImageYIQ, 0.2));
        }

        // ========================================================================================================================
        // ========================================================================================================================
        
        // Transform flow 6: pass-minor weighted + stripped (no YIQ)

        {
            let container = CreateFlowContainer("pass-minor weighted + stripped (no YIQ)");
            AddCanvas(container, "Source", ImageData);

            // RGB->norm
            let planar = RGB_to_norm(ImageData);

            // transform:
            for (let c = 0; c < planar.Channels.length; ++c)
            {
                transform_2d_pass_minor_weighted(planar.Channels[c], planar.Width, planar.Height);
            }
            AddCanvas(container, "Transformed (pass-minor weighted)", Visualize_Linear_FixedRange(planar, 0.2));

            // Strip:
            StripInsignificantCoefficients(planar, 40);
            AddCanvas(container, "Transformed Stripped", Visualize_Linear_FixedRange(planar, 0.2));

            // Reverse transform:
            for (let c = 0; c < planar.Channels.length; ++c)
            {
                reverse_2d_pass_minor_weighted(planar.Channels[c], planar.Width, planar.Height);
            }
            AddCanvas(container, "Stripped RGB", norm_to_RGB(planar));
        }
    }
}

function CreateFlowContainer(name : string) : HTMLElement
{
    let ResultsContainer = document.getElementById("results");
    let NewResultContainer = document.createElement("div");
    ResultsContainer?.appendChild(NewResultContainer);
    let FlowContainer = document.createElement("div");
    FlowContainer.classList.add("flow-container");
    let NameElement = document.createElement("p");
    NameElement.appendChild(document.createTextNode(name));
    NewResultContainer?.appendChild(NameElement);
    NewResultContainer?.appendChild(FlowContainer);
    return FlowContainer;
}

function StripInsignificantCoefficients(data : PlanarImageData, num_coefficients : number)
{
    let signature = GetHighestCoefficientIndices(data.Channels, num_coefficients);
    console.log(signature);
    // Let's kill all coefficients which are not in the signature
    for (let c = 0; c < data.Channels.length; ++c)
    {
        let channel = data.Channels[c];
        let num_pixels = data.Width * data.Height;
        for (let i = 1; i < num_pixels; ++i)
        {
            if (!signature.ACCoefficients[c].includes(i))
            {
                channel[i] = 0;
            }
        }
    }
}

// Transform function for testing purposes; halves all values.
function TestTransform(arr : Float64Array, width : number, height : number)
{
    let total = width * height;
    for (let i = 0; i < total; ++i)
    {
        arr[i] *= 0.5;
    }
}

function SetCanvasContent(canvas : HTMLCanvasElement, data : ImageData)
{
    canvas.width = data.width;
    canvas.height = data.height;
    let c2d = canvas.getContext("2d")!;
    c2d.putImageData(data, 0, 0);
}

function AddCanvas(container : HTMLElement, name : string, data : ImageData)
{
    let box = document.createElement("div");
    box.appendChild(document.createTextNode(name));
    box.appendChild(document.createElement("br"));
    let canvas = document.createElement("canvas");
    canvas.width = data.width;
    canvas.height = data.height;
    box.appendChild(canvas);
    let c2d = canvas.getContext("2d")!;
    c2d.putImageData(data, 0, 0);
    container.appendChild(box);
}

// RGB to YIQ original code:
//do { \
//    int i; \
//    \
//    for (i = 0; i < NUM_PIXELS_SQUARED; i++) { \
//      Unit Y, I, Q; \
//      \
//      Y = 0.299 * a[i] + 0.587 * b[i] + 0.114 * c[i]; \
//      I = 0.596 * a[i] - 0.275 * b[i] - 0.321 * c[i]; \
//      Q = 0.212 * a[i] - 0.523 * b[i] + 0.311 * c[i]; \
//      a[i] = Y; \
//      b[i] = I; \
//      c[i] = Q; \
//    } \
//  } while(0)

interface PlanarImageData
{
    Channels : Float64Array[];
    Width : number;
    Height : number;
}

function RGB_to_norm(ImageData : ImageData) : PlanarImageData
{
    let orig = ImageData.data;
    let norm255 = 1.0 / 255.0;
    let NumPixels = ImageData.width * ImageData.height;
    let Channels = new Array<Float64Array>(3);
    for (let c = 0; c < Channels.length; ++c)
    {
        Channels[c] = new Float64Array(NumPixels);
    }
    for (let i = 0; i < NumPixels; ++i)
    {
        Channels[0][i] = orig[i * 4 + 0] * norm255;
        Channels[1][i] = orig[i * 4 + 1] * norm255;
        Channels[2][i] = orig[i * 4 + 2] * norm255;
    }
    return { Channels: Channels, Width: ImageData.width, Height: ImageData.height };
}

function norm_to_RGB(planar : PlanarImageData) : ImageData
{
    let NumPixels = planar.Width * planar.Height;
    let length = NumPixels * 4;
    let rgb = new Uint8ClampedArray(length);
    for (let i = 0; i < NumPixels; ++i)
    {
        rgb[i * 4 + 0] = planar.Channels[0][i] * 255.0;
        rgb[i * 4 + 1] = planar.Channels[1][i] * 255.0;
        rgb[i * 4 + 2] = planar.Channels[2][i] * 255.0;
        rgb[i * 4 + 3] = 255;
    }
    return new ImageData(rgb, planar.Width, planar.Height);
}

function RGB_to_YIQ(ImageData : ImageData) : PlanarImageData
{
    let orig = ImageData.data;
    let norm255 = 1.0 / 255.0;
    let NumPixels = ImageData.width * ImageData.height;
    let Y = new Float64Array(NumPixels);
    let I = new Float64Array(NumPixels);
    let Q = new Float64Array(NumPixels);
    for (let i = 0; i < NumPixels; ++i)
    {
        let r = orig[i * 4 + 0] * norm255;
        let g = orig[i * 4 + 1] * norm255;
        let b = orig[i * 4 + 2] * norm255;
        Y[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        I[i] = 0.596 * r - 0.275 * g - 0.321 * b;
        Q[i] = 0.212 * r - 0.523 * g + 0.311 * b;
    }
    return { Channels: [ Y, I, Q ], Width: ImageData.width, Height: ImageData.height };
}

function YIQ_to_RGB(YIQ : PlanarImageData) : ImageData
{
    let NumPixels = YIQ.Width * YIQ.Height;
    let length = NumPixels * 4;
    let rgb = new Uint8ClampedArray(length);
    let Y = YIQ.Channels[0];
    let I = YIQ.Channels[1];
    let Q = YIQ.Channels[2];
    for (let i = 0; i < NumPixels; ++i)
    {
        rgb[i * 4 + 0] = 255.0 * (Y[i] + I[i] * 0.956 + Q[i] * 0.619);
        rgb[i * 4 + 1] = 255.0 * (Y[i] - I[i] * 0.272 - Q[i] * 0.647);
        rgb[i * 4 + 2] = 255.0 * (Y[i] - I[i] * 1.106 + Q[i] * 1.703);
        rgb[i * 4 + 3] = 255;
    }
    let Converted = new ImageData(rgb, YIQ.Width, YIQ.Height);
    return Converted;
}

function Visualize_YIQ(YIQ : PlanarImageData) : ImageData
{
    let NumPixels = YIQ.Width * YIQ.Height;
    let length = NumPixels * 4;
    let rgb = new Uint8ClampedArray(length);
    // All YIQ values should range from 0..1.
    for (let i = 0; i < NumPixels; ++i)
    {
        // We'll use R <- I, B <- Q, G <- Y
        // This'll probably look better.
        // I hope the Uint8ClampedArray automatically does the clamping as the name would imply...
        rgb[i * 4 + 0] = YIQ.Channels[1][i] * 255.0;
        rgb[i * 4 + 1] = YIQ.Channels[0][i] * 255.0;
        rgb[i * 4 + 2] = YIQ.Channels[2][i] * 255.0;
        rgb[i * 4 + 3] = 255;
    }
    let Converted = new ImageData(rgb, YIQ.Width, YIQ.Height);
    return Converted;
}

// General purpose - automatically detects max/min.
function Visualize_Linear_AutoScale(d : PlanarImageData) : ImageData
{
    let NumPixels = d.Width * d.Height;
    let length = NumPixels * 4;
    let rgb = new Uint8ClampedArray(length);
    // NOTE: The initial values are deliberately 0 here:
    let MaxValues = new Float64Array(d.Channels.length);
    for (let c = 0; c < d.Channels.length; ++c)
    {
        let ch = d.Channels[c];
        for (let i = 0; i < NumPixels; ++i)
        {
            let value = ch[i];
            let value_abs = Math.abs(value);
            if (value_abs > MaxValues[c]) MaxValues[c] = value_abs;
        }
    }
    for (let i = 0; i < NumPixels; ++i)
    {
        rgb[i * 4 + 0] = (d.Channels[1][i] / MaxValues[1]) * 127.5 + 127.5;
        rgb[i * 4 + 1] = (d.Channels[0][i] / MaxValues[0]) * 127.5 + 127.5;
        rgb[i * 4 + 2] = (d.Channels[2][i] / MaxValues[2]) * 127.5 + 127.5;
        rgb[i * 4 + 3] = 255;
    }
    let Converted = new ImageData(rgb, d.Width, d.Height);
    return Converted;
}

function Visualize_Linear_FixedRange(d : PlanarImageData, range : number) : ImageData
{
    let NumPixels = d.Width * d.Height;
    let length = NumPixels * 4;
    let rgb = new Uint8ClampedArray(length);
    // NOTE: The initial values are deliberately 0 here:
    for (let i = 0; i < NumPixels; ++i)
    {
        rgb[i * 4 + 0] = d.Channels[1][i] / range * 127.5 + 127.5;
        rgb[i * 4 + 1] = d.Channels[0][i] / range * 127.5 + 127.5;
        rgb[i * 4 + 2] = d.Channels[2][i] / range * 127.5 + 127.5;
        rgb[i * 4 + 3] = 255;
    }
    let Converted = new ImageData(rgb, d.Width, d.Height);
    return Converted;
}

function GetFileFromFileInput(e : HTMLInputElement) : (File | null)
{
    let files = e.files;
    if (files)
    {
        let tmp = files[0];
        return tmp ?? null;
    }
    else
    {
        return null;
    }
}

// data is the pixel values from a single channel. In case of RGB or YIQ, that's values normalized form 0..1.
function transform_2d_pass_major(data : Float64Array, width : number, height : number)
{
	// This transform doesn't work inplace, we'd need a buffer of atleast width/2 elements.
	// Since we can't do it inplace anyway, we just allocate an entirely new result array for the lulz.
	let result = new Float64Array(data.length);

	// stride is equal to width because every array element is one pixel.
	let stride = width;
	
	let half_point = width;
	while (half_point > 1)
	{
		let last_half_point = half_point;
		half_point >>= 1;
		
		//
		// Transform rows horizontally
		//
		
		for (let row = 0; row < last_half_point; ++row)
		{
			let row_start = row * stride;
			for (let x = 0; x < half_point; ++x)
			{
                let right_operand =                  data[row_start + x * 2 + 1] / 2.0;
                result[row_start + x] =              data[row_start + x * 2    ] / 2.0 + right_operand;
                result[row_start + x + half_point] = data[row_start + x * 2    ] / 2.0 - right_operand;
				//let right_operand =                    ((data[row_start + x * 2 + 1] & 0x00fefefe) >>> 1);
				//result[row_start + x] =               (((data[row_start + x * 2    ] & 0xfefefefe) >>> 1) | 0xFF000000) + right_operand;
				//result[row_start + x + half_point] =  (((data[row_start + x * 2    ] & 0xfefefefe) >>> 1) | 0xFF808080) - right_operand;
			}
			
			for (let x = 0; x < width; ++x)
			{
				data[row_start + x] = result[row_start + x];
			}
		}
	
		//
		// Transform columns vertically
		//
		
		for (let col = 0; col < last_half_point; ++col)
		{
			for (let y = 0; y < half_point; ++y)
			{
                let right_operand =                       data[(y*2+1) * stride + col] / 2.0;
                result[ y               * stride + col] = data[ y*2    * stride + col] / 2.0 + right_operand;
                result[(y + half_point) * stride + col] = data[ y*2    * stride + col] / 2.0 - right_operand;
				//let right_operand =                        ((data[(y*2+1) * stride + col] & 0x00fefefe) >>> 1);
				//result[ y               * stride + col] = (((data[ y*2    * stride + col] & 0xfefefefe) >>> 1) | 0xFF000000) + right_operand;
				//result[(y + half_point) * stride + col] = (((data[ y*2    * stride + col] & 0xfefefefe) >>> 1) | 0xFF808080) - right_operand;
			}
			
			for (let y = 0; y < height; ++y)
			{
				data[y * stride + col] = result[y * stride + col];
			}
		}
	}	
	
	return result;
}

function transform_2d_pass_minor(data : Float64Array, width : number, height : number)
{
	// This transform doesn't work inplace, we'd need a buffer of atleast width/2 elements.
	// Since we can't do it inplace anyway, we just allocate an entirely new result array for the lulz.
	let result = new Float64Array(data.length);

	// stride is equal to width because every array element is a pixel.
	let stride = width;
	
	//
	// Transform rows horizontally
	//
	
	for (let row = 0; row < height; ++row)
	{
        let row_start = row * stride;
		let half_point = width;
		while (half_point > 1)
		{
			half_point >>= 1;
			for (let x = 0; x < half_point; ++x)
			{
				//let right_operand =                    ((data[row_start + x * 2 + 1] & 0x00fefefe) >>> 1);
				//result[row_start + x] =               (((data[row_start + x * 2    ] & 0xfefefefe) >>> 1) | 0xFF000000) + right_operand;
				//result[row_start + x + half_point] =  (((data[row_start + x * 2    ] & 0xfefefefe) >>> 1) | 0xFF808080) - right_operand;
                let right_operand =                  data[row_start + x * 2 + 1] / 2.0;
                result[row_start + x] =              data[row_start + x * 2    ] / 2.0 + right_operand;
                result[row_start + x + half_point] = data[row_start + x * 2    ] / 2.0 - right_operand;
			}
			
			for (let x = 0; x < width; ++x)
			{
				data[row_start + x] = result[row_start + x];
			}
		}
	}
	
	//
	// Transform columns vertically
	//
	
	for (let col = 0; col < width; ++col)
	{
		let half_point = height;
		while (half_point > 1)
		{
			half_point >>= 1;
			for (let y = 0; y < half_point; ++y)
			{
				//let right_operand =                        ((data[(y*2+1) * stride + col] & 0x00fefefe) >>> 1);
				//result[ y               * stride + col] = (((data[ y*2    * stride + col] & 0xfefefefe) >>> 1) | 0xFF000000) + right_operand;
				//result[(y + half_point) * stride + col] = (((data[ y*2    * stride + col] & 0xfefefefe) >>> 1) | 0xFF808080) - right_operand;
                let right_operand =                       data[(y*2+1) * stride + col] / 2.0;
                result[ y               * stride + col] = data[ y*2    * stride + col] / 2.0 + right_operand;
                result[(y + half_point) * stride + col] = data[ y*2    * stride + col] / 2.0 - right_operand;
			}
			
			for (let y = 0; y < height; ++y)
			{
				data[y * stride + col] = result[y * stride + col];
			}
		}
	}
	
	return result;
}

function reverse_2d_pass_minor(data : Float64Array, width : number, height : number)
{
    let result = new Float64Array(data.length);
    let stride = width;

    // Reverse columns vertically
    for (let col = 0; col < width; ++col)
    {
        let half_point = 1;
        while (true)
        {
            if (half_point > (height >> 1))
            {
                break;
            }
            for (let y = 0; y < half_point; ++y)
            {
                let left_operand =  data[ y               * stride + col];
                let right_operand = data[(y + half_point) * stride + col];
                result[ y*2      * stride + col] = left_operand + right_operand;
                result[(y*2 + 1) * stride + col] = left_operand - right_operand;
            }
            for (let y = 0; y < half_point * 2; ++y)
            {
                data[y * stride + col] = result[y * stride + col];
            }
            half_point <<= 1;
        }
    }

    // Reverse rows horizontally
    for (let row = 0; row < height; ++row)
    {
        let row_start = row * stride;
        let half_point = 1;
        while (true)
        {
            if (half_point > (width >> 1))
            {
                break;
            }
            for (let x = 0; x < half_point; ++x)
            {
                let left_operand =  data[row_start + x             ];
                let right_operand = data[row_start + x + half_point];
                result[row_start + x*2    ] = left_operand + right_operand;
                result[row_start + x*2 + 1] = left_operand - right_operand;
            }
            for (let x = 0; x < half_point * 2; ++x)
            {
                data[row_start + x] = result[row_start + x];
            }
            half_point <<= 1;
        }
    }
}

function transform_2d_pass_minor_weighted(data : Float64Array, width : number, height : number)
{
	// This transform doesn't work inplace, we'd need a buffer of atleast width/2 elements.
	// Since we can't do it inplace anyway, we just allocate an entirely new result array for the lulz.
	let result = new Float64Array(data.length);

	// stride is equal to width because every array element is a pixel.
	let stride = width;
	
	//
	// Transform rows horizontally
	//
	
	for (let row = 0; row < height; ++row)
	{
        let row_start = row * stride;
		let half_point = width;
        let C = 1.0;
		while (half_point > 1)
		{
			half_point >>= 1;
            C *= 0.7071; // 1/sqrt(2)
			for (let x = 0; x < half_point; ++x)
			{
                let right_operand =                   data[row_start + x * 2 + 1];
                result[row_start + x] =               data[row_start + x * 2    ] + right_operand;
                result[row_start + x + half_point] = (data[row_start + x * 2    ] - right_operand) * C;
			}
			
			for (let x = 0; x < width; ++x)
			{
				data[row_start + x] = result[row_start + x];
			}
		}

        // Fix first element of each row:
        data[row_start] *= C;
	}
	
	//
	// Transform columns vertically
	//
	
	for (let col = 0; col < width; ++col)
	{
		let half_point = height;
        let C = 1.0;
		while (half_point > 1)
		{
			half_point >>= 1;
            C *= 0.7071; // 1/sqrt(2)
			for (let y = 0; y < half_point; ++y)
			{
                let right_operand =                        data[(y*2+1) * stride + col];
                result[ y               * stride + col] =  data[ y*2    * stride + col] + right_operand;
                result[(y + half_point) * stride + col] = (data[ y*2    * stride + col] - right_operand) * C;
			}
			
			for (let y = 0; y < height; ++y)
			{
				data[y * stride + col] = result[y * stride + col];
			}
		}

        // Fix first element of each column:
        data[col] *= C;
	}
	
	return result;
}

function reverse_2d_pass_minor_weighted(data : Float64Array, width : number, height : number)
{
    let result = new Float64Array(data.length);
    let stride = width;

    let other = 1.0 / 0.7071;

    // Reverse columns vertically
    for (let col = 0; col < width; ++col)
    {
        let half_point_tmp = height;
        let C = 1.0;
        while (half_point_tmp > 1)
        {
            half_point_tmp >>= 1;
            C *= 0.7071; // 1/sqrt(2)
        }

        data[col] /= C;

        let half_point = 1;
        //let C = 1.0;
        while (true)
        {
            if (half_point > (height >> 1))
            {
                break;
            }
            C *= other;
            for (let y = 0; y < half_point; ++y)
            {
                let left_operand =  data[ y               * stride + col];
                let right_operand = data[(y + half_point) * stride + col] / C;
                result[ y*2      * stride + col] = (left_operand + right_operand) / 2.0;
                result[(y*2 + 1) * stride + col] = (left_operand - right_operand) / 2.0;
            }
            for (let y = 0; y < half_point * 2; ++y)
            {
                data[y * stride + col] = result[y * stride + col];
            }
            half_point <<= 1;
        }

        // for (let y = 0; y < height; ++y)
        // {
        //     data[y * stride + col] *= C;
        // }
    }

    // Reverse rows horizontally
    for (let row = 0; row < height; ++row)
    {
        let row_start = row * stride;

        let half_point_tmp = width;
        let C = 1.0;
        while (half_point_tmp > 1)
        {
            half_point_tmp >>= 1;
            C *= 0.7071; // 1/sqrt(2)
        }

        data[row_start] /= C;
        let half_point = 1;
        while (true)
        {
            if (half_point > (width >> 1))
            {
                break;
            }
            C *= other;
            for (let x = 0; x < half_point; ++x)
            {
                let left_operand =  data[row_start + x             ];
                let right_operand = data[row_start + x + half_point] / C;
                result[row_start + x*2    ] = (left_operand + right_operand) / 2.0;
                result[row_start + x*2 + 1] = (left_operand - right_operand) / 2.0;
            }
            for (let x = 0; x < half_point * 2; ++x)
            {
                data[row_start + x] = result[row_start + x];
            }
            half_point <<= 1;
        }
    }
}

interface Signature
{
    DCCoefficients : number[];
    ACCoefficients : number[][];
}

function GetHighestCoefficientIndices(channels : Float64Array[], NumWantedACCoefficients : number) : Signature
{
    // DC coefficients:
    let DCCoefficients = new Array<number>(channels.length);
    for (let c = 0; c < channels.length; ++c)
    {
        DCCoefficients[c] = channels[c][0];
    }
    // AC coefficients:
    let ACCoefficients = new Array<Array<number>>(channels.length);
    for (let c = 0; c < channels.length; ++c)
    {
        ACCoefficients[c] = new Array<number>(NumWantedACCoefficients);
        let channel = channels[c];
        interface ValueWithIndex
        {
            Value : number;
            Index : number;
        }
        // Skip the first element because that already goes in the DCCoefficients.
        let bleh = new Array<ValueWithIndex>(channel.length - 1);
        for (let i = 0; i < bleh.length; ++i)
        {
            bleh[i] = { Index: i + 1, Value: channel[i + 1] };
        }
        // Sort descending
        bleh.sort((a, b) => Math.abs(b.Value) - Math.abs(a.Value));
        let wanted = bleh.slice(0, NumWantedACCoefficients);
        ACCoefficients[c] = wanted.map(x => x.Index);
    }

    return { DCCoefficients: DCCoefficients, ACCoefficients: ACCoefficients };
}
