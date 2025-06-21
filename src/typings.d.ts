declare module 'jslib-html5-camera-photo' {
  // You can add more specific types if you want, but this is enough to remove the TypeScript warning.
  var cameraPhoto: any;
  export default cameraPhoto;
  export const FACING_MODES: any;
  export interface ICameraPhoto {
    startCamera: (...args: any[]) => Promise<void>;
    stopCamera: () => void;
    getDataUri: () => string;
  }
}