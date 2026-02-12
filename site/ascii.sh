#!/usr/bin/env bash

# --- Configuration ---

# The ratio between the width and height of the font used for rendering.
FONT_RATIO="0.44"

LUMINANCE_THRESHOLD_LOW=5
LUMINANCE_THRESHOLD_HIGH=235

ASCII_CHARS=" .~-_=+*%#0oOxX@$"

VIDEO_FORMATS=("mp4" "mkv" "mov" "avi")
OUTPUT_FPS=30
OUTPUT_COLUMNS=90

# --- Functions ---

detect_background() {
    awk '
    NR > 1 && NR <= 11 {
        gsub(/[^0-9,]/, "", $2)
        n = split($2, c, ",")
        r = int(c[1])
        if (n == 1) { g = r; b = r } else { g = int(c[2]); b = int(c[3]) }
        total += 0.2126*r + 0.7152*g + 0.0722*b
        cnt++
    }
    END { print (cnt > 0 && total/cnt > 200) ? "light" : "dark" }
    ' "$1"
}

convert_frame_to_ascii() {
    local im_text_file="$1"
    local output_file="$2"
    local threshold_low="$3"
    local threshold_high="$4"
    local chars="$5"

    local bg_type
    bg_type=$(detect_background "$im_text_file")

    local content_max
    content_max=$(awk -v tlow="$threshold_low" -v thigh="$threshold_high" -v bg="$bg_type" '
    NR == 1 { next }
    {
        gsub(/[^0-9,]/, "", $2)
        n = split($2, c, ",")
        r = int(c[1])
        if (n == 1) { g = r; b = r } else { g = int(c[2]); b = int(c[3]) }
        lum = int(0.2126*r + 0.7152*g + 0.0722*b)
        is_bg = 0
        if (bg == "light" && lum > thigh) is_bg = 1
        if (bg == "dark" && lum < tlow) is_bg = 1
        if (!is_bg && lum > max) max = lum
    }
    END { print (max > 0) ? max : 255 }
    ' "$im_text_file")

    awk -v tlow="$threshold_low" -v thigh="$threshold_high" -v chars="$chars" -v bg="$bg_type" -v cmax="$content_max" '
    BEGIN {
        num_chars = length(chars)
        if (bg == "light") {
            lum_floor = 0
            lum_ceil = thigh
        } else {
            lum_floor = tlow
            lum_ceil = cmax
        }
        lum_range = lum_ceil - lum_floor
        if (lum_range <= 0) lum_range = 1
        last_row = -1
        col_count = 0
        row_text = ""
        printf "[\n"
        first_row = 1
    }
    NR == 1 { next }
    {
        split($1, pos, ",")
        row = int(pos[2])

        rgb_str = $2
        gsub(/[^0-9,]/, "", rgb_str)
        n = split(rgb_str, c, ",")
        r = int(c[1])
        if (n == 1) { g = r; b = r } else { g = int(c[2]); b = int(c[3]) }

        lum = int(0.2126*r + 0.7152*g + 0.0722*b)

        is_bg = 0
        if (bg == "light" && lum > thigh) is_bg = 1
        if (bg == "dark" && lum < tlow) is_bg = 1

        if (row != last_row) {
            if (last_row != -1) {
                if (!first_row) printf ",\n"
                printf "[\"%s\",[", row_text
                for (i = 0; i < col_count; i++) {
                    if (i > 0) printf ","
                    printf "\"%s\"", row_color[i]
                }
                printf "]]"
                first_row = 0
            }
            row_text = ""
            col_count = 0
            delete row_color
            last_row = row
        }

        if (is_bg) {
            row_text = row_text " "
            row_color[col_count] = ""
        } else {
            idx = int(((lum - lum_floor) * (num_chars - 1)) / lum_range)
            if (idx < 0) idx = 0
            if (idx >= num_chars) idx = num_chars - 1
            row_text = row_text substr(chars, idx + 1, 1)
            row_color[col_count] = sprintf("%02x%02x%02x", r, g, b)
        }
        col_count++
    }
    END {
        if (last_row != -1) {
            if (!first_row) printf ",\n"
            printf "[\"%s\",[", row_text
            for (i = 0; i < col_count; i++) {
                if (i > 0) printf ","
                printf "\"%s\"", row_color[i]
            }
            printf "]]"
        }
        printf "\n]\n"
    }
    ' "$im_text_file" > "$output_file"
}

generate_frame_images() {
    local video_file="$1"
    local working_dir="$2"
    local frame_images_dir="$working_dir/frame_images"
    mkdir -p "$frame_images_dir"

    echo "Extracting frames from '$video_file'..."
    ffmpeg \
        -loglevel error \
        -i "$video_file" \
        -vf "scale=$OUTPUT_COLUMNS:-2,fps=$OUTPUT_FPS" \
        "$frame_images_dir/frame_%04d.png"

    local total_frames
    total_frames=$(find "$frame_images_dir" -name '*.png' | wc -l | tr -d ' ')
    local current=0

    echo "Processing $total_frames frames into ASCII..."
    for f in $(find "$frame_images_dir" -name '*.png' | sort); do
        current=$((current + 1))

        local image_height
        image_height=$(magick identify -ping -format '%h' "$f")
        local new_height
        new_height=$(awk -v ratio="$FONT_RATIO" -v height="$image_height" 'BEGIN{print int(ratio * height + 0.5)}')

        local squished_file="${f%.png}_sq.png"
        magick "$f" -resize "x$new_height"'!' "$squished_file"

        local im_text_file="${f%.png}_im.txt"
        magick "$squished_file" "$im_text_file"

        local output_text_file="${f%.png}.json"
        convert_frame_to_ascii "$im_text_file" "$output_text_file" "$LUMINANCE_THRESHOLD_LOW" "$LUMINANCE_THRESHOLD_HIGH" "$ASCII_CHARS"

        rm "$f" "$squished_file" "$im_text_file"
        printf "\r  [%d/%d] %s" "$current" "$total_frames" "${f##*/}"
    done
    echo ""
    echo "ASCII generation complete."
}

#
# Main function to orchestrate the video-to-ASCII conversion.
#
# @param $1: The path to the video file
#
video_to_terminal() {
    local video_file="$1"
    if [[ -z "$video_file" ]]; then
        >&2 echo "Error: No input file specified."
        >&2 echo "Usage: $0 <path_to_video_file>"
        return 1
    fi

    if [[ ! -f "$video_file" ]]; then
        >&2 echo "Error: Input file '$1' does not exist."
        return 1
    fi

    local file_extension
    file_extension="$(echo "${video_file##*.}" | awk '{print tolower($0)}')"
    if [[ ! " ${VIDEO_FORMATS[*]} " =~ " ${file_extension} " ]]; then
        >&2 echo "Error: Unsupported file format '$file_extension'."
        >&2 echo "Supported formats: ${VIDEO_FORMATS[*]}"
        return 1
    fi

    local video_name
    video_name="$(basename "${video_file%.*}")"
    local working_dir="./ascii_${video_name}"
    mkdir "$working_dir"
    echo "Created working directory: $working_dir"

    generate_frame_images "$video_file" "$working_dir"

    echo "All frames processed. Output files are in '$working_dir/frame_images/'"
}

# --- Execution ---
video_to_terminal "$1"
