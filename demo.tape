Output demo.gif

Set Shell zsh
Set Width 900
Set Height 550
Set FontSize 14
Set Padding 15
Set TypingSpeed 40ms

Type `node`
Enter
Sleep 1s

Type `const video = await import('./dist/index.js')`
Enter
Sleep 1s

Type `// 12 video operations available`
Enter
Sleep 300ms
Type `Object.keys(video).filter(k => typeof video[k] === 'function')`
Enter
Sleep 1.5s

Type `// Get video info`
Enter
Sleep 300ms
Type `await video.info('sample.mp4')`
Enter
Sleep 2s

Type `// Extract a thumbnail at 5 seconds`
Enter
Sleep 300ms
Type `const thumb = await video.thumbnail('sample.mp4', { time: 5 })`
Enter
Sleep 1s
Type "console.log('Thumbnail:', thumb)"
Enter
Sleep 1.5s

Type `.exit`
Enter
Sleep 500ms
