import path from 'path'
import pluginTester from 'babel-plugin-tester'
import importIntlAdvancePlugin from '../index'

pluginTester({
  plugin: importIntlAdvancePlugin,
  pluginOptions: {
    messagesDir: './src/messages',
    locale: 'en-GB',
  },
  fixtures: path.join(__dirname, 'fixtures'),
})
