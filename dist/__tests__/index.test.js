import path from 'path'
import pluginTester from 'babel-plugin-tester'
import importIntlAdvancePlugin from '../index'

pluginTester({
  plugin: importIntlAdvancePlugin,
  pluginOptions: {
    messagesDir: './',
    locale: 'en-GB',
  },
  fixtures: path.join(__dirname, 'fixtures'),
})
