import { CloudUpload } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

type Props = {
  upload: (file: Blob) => void;
  loading: boolean;
};

export default function PhotoUploadWidget({ upload, loading }: Props) {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    return () => {
        files.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map(file =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles(mappedFiles);
  }, []);

  const onCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob(blob => {
      if (blob) upload(blob);
    }, 'image/jpeg');
  }, [upload]);

  // ✅ Cleanup preview URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
      gap={3}
    >
      {/* Step 1 - Add Photo */}
      <Box>
        <Typography variant="overline" color="secondary">
          Step 1 - Add Photo
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            paddingTop: '30px',
            borderColor: isDragActive ? 'green' : '#eee',
            textAlign: 'center',
            height: '280px',
            borderRadius: 2,
            border: '1px solid #ccc',
            backgroundColor: '#fafafa',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 80 }} />
          <Typography variant="h5">Drop photo here</Typography>
          {isDragActive ? (
            <Typography>Drop the files here ...</Typography>
          ) : (
            <Typography>
              Drag & drop some files here, or click to select files
            </Typography>
          )}
        </Box>
      </Box>

      {/* Step 2 - Resize Photo */}
      <Box>
        <Typography variant="overline" color="secondary">
          Step 2 - Resize Photo
        </Typography>
        {files[0]?.preview && (
          <Cropper
            src={files[0].preview}
            style={{ height: 300, width: '90%' }}
            initialAspectRatio={1}
            aspectRatio={1}
            preview=".img-preview"
            guides={false}
            ref={cropperRef}
            viewMode={1}
            background={false}
          />
        )}
      </Box>

      {/* Step 3 - Preview & Upload Photo */}
      <Box>
        <Typography variant="overline" color="secondary">
          Step 3 - Preview & Upload Photo
        </Typography>

        {files[0]?.preview && (
          <Box
            sx={{
              mt: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'right',
            }}
          >
            {/* Live cropped preview */}
            <Box
              className="img-preview"
              sx={{
                width: 300,
                height: 300,
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid #ccc',
                backgroundColor: '#fafafa',
              }}
            />

            {/* Upload button */}
            <Button
              onClick={onCrop}
              variant="contained"
              color="secondary"
              sx={{ mt: 1, width: 300 }}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>

          </Box>
        )}
      </Box>
    </Box>
  );
}
