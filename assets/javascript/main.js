const App = () => {
    const [theme, setTheme] = React.useState('dark');
    const themeVars = theme === 'dark' ?
        {
            app: {backgroundColor: '#333444'},
            terminal: {boxShadow: '0 2px 5px #111'},
            window: {backgroundColor: '#222345', color: '#F4F4F4'},
            field: {backgroundColor: '#222333', color: '#F4F4F4', fontWeight: 'normal'},
            cursor: {animation: '1.02s blink-dark step-end infinite'}
        } : {
            app: {backgroundColor: '#ACA9BB'},
            terminal: {boxShadow: '0 2px 5px #33333375'},
            window: {backgroundColor: '#5F5C6D', color: '#E3E3E3'},
            field: {backgroundColor: '#E3E3E3', color: '#474554', fontWeight: 'bold'},
            cursor: {animation: '1.02s blink-light step-end infinite'}
        };
    return React.createElement("div", {id: "app", style: themeVars.app}, React.createElement(Terminal, {theme: themeVars, setTheme: setTheme}));
};
const Terminal = ({theme, setTheme}) => {
    const [maximized, setMaximized] = React.useState(false);
    const handleClose = () => window.location.href = 'https://github.com/TolqaDev';
    const handleMinify = () => window.location.href = 'https://instagram.com/tolqa.dev';
    const handleMinMax = () => {setMaximized(!maximized); document.querySelector('#field').focus();};
    return  React.createElement("div", {id: "terminal", style: maximized ? {height: '100vh', width: '100vw', maxWidth: '100vw'} : theme.terminal},
			React.createElement("div", {id: "window", style: theme.window},
			React.createElement("button", {className: "btn red", onClick: handleClose}),
			React.createElement("button", {className: "btn yellow", onClick: handleMinify}),
			React.createElement("button", {className: "btn green", onClick: handleMinMax})),
			React.createElement(Field, {theme: theme, setTheme: setTheme}));
};
class Field extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commandHistory: [],
            commandHistoryIndex: 0,
            fieldHistory: [
				{
					text: 'Type HELP to see the full list of commands.',
					hasBuffer: true
            	}
			],
            userInput: 'HELP',
            isMobile: false
        };
        this.recognizedCommands = [
		{
            command: 'help',
            purpose: 'Provides help information Terminal commands.'
        },
            {
                command: 'about',
                isMain: true,
                purpose: 'Displays basic information about TolqaDev.'
            },
            {
                command: 'experience',
                isMain: true,
                purpose: 'Displays information about TolqaDev\'s experience.'
            },
            {
                command: 'skills',
                isMain: true,
                purpose: 'Displays information about TolqaDev\'s skills as a developer.'
            },
            {
                command: 'projects',
                isMain: true,
                purpose: 'Displays information about what projects TolqaDev has done in the past.'
            },
            {
                command: 'project',
                isMain: true,
                purpose: 'Launches a specified project in a new tab or separate window.',
                help: [
                    'PROJECT <TITLE> Launches a specified project in a new tab or separate window.',
                    'List of projects currently include:',
                    'VisualByFuture',
                    'JetCompany',
                    '',
                    'TITLE....................The title of the project you want to view.']
            },
			{
				command: 'contacts',
				isMain: true,
				purpose: 'Displays contact information for TolqaDev.'
			},
            {
                command: 'contact',
                isMain: true,
                purpose: 'Launches a specified contact in a new tab or separate window.',
                help: [
                    'CONTACT <TITLE> Launches a specified info in a new tab or separate window.',
                    'List of projects currently include:',
                    'Email',
                    'GitHub',
                    'LinkedIn',
                    'Instagram',
                    'Twitter',
                    '',
                    'TITLE....................The title of the info you want to view.']
            },
			{
				command: 'clear',
				purpose: 'Clears the screen.'
			},
			{
				command: 'theme',
				purpose: 'Sets the color scheme of the React Terminal.',
				help: ['THEME < L | D > [-s]']
			},
        ];
        this.handleTyping = this.handleTyping.bind(this);
        this.handleInputEvaluation = this.handleInputEvaluation.bind(this);
        this.handleInputExecution = this.handleInputExecution.bind(this);
        this.handleContextMenuPaste = this.handleContextMenuPaste.bind(this);
    }
    componentDidMount() {
        if (typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1) {
            this.setState(state => ({
                isMobile: true,
                fieldHistory: [...state.fieldHistory, {isCommand: true}, {
                    text: `Unfortunately due to this application being an 'input-less' environment, mobile is not supported. I'm working on figuring out how to get around this, so please bear with me! In the meantime, come on back if you're ever on a desktop.`,
                    isError: true,
                    hasBuffer: true
                }]
            }));
        }
    }
    componentDidUpdate() {
        const userElem = document.querySelector('#field');
        userElem.scrollTop = userElem.scrollHeight;
    }
    handleTyping(e) {
        e.preventDefault();
        const {key, ctrlKey, altKey} = e;
        const forbidden = [
            ...Array.from({length: 12}, (x, y) => `F${y + 1}`),
            'ContextMenu', 'Meta', 'NumLock', 'Shift', 'Control', 'Alt',
            'CapsLock', 'Tab', 'ScrollLock', 'Pause', 'Insert', 'Home',
            'PageUp', 'Delete', 'End', 'PageDown'];
        if (!forbidden.some(s => s === key) && !ctrlKey && !altKey) {
            if (key === 'Backspace') {
                this.setState(state => state.userInput = state.userInput.slice(0, -1));
            } else if (key === 'Escape') {
                this.setState({userInput: ''});
            } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
                const {commandHistory, commandHistoryIndex} = this.state;
                const upperLimit = commandHistoryIndex >= commandHistory.length;
                if (!upperLimit) {
                    this.setState(state => ({
                        commandHistoryIndex: state.commandHistoryIndex += 1,
                        userInput: state.commandHistory[state.commandHistoryIndex - 1]
                    }));
                }
            } else if (key === 'ArrowDown' || key === 'ArrowRight') {
                const {commandHistory, commandHistoryIndex} = this.state;
                const lowerLimit = commandHistoryIndex === 0;
                if (!lowerLimit) {
                    this.setState(state => ({
                        commandHistoryIndex: state.commandHistoryIndex -= 1,
                        userInput: state.commandHistory[state.commandHistoryIndex - 1] || ''
                    }));
                }
            } else if (key === 'Enter') {
                const {userInput} = this.state;
                if (userInput.length) {
                    this.setState(state => ({
                            commandHistory: userInput === '' ? state.commandHistory : [userInput, ...state.commandHistory],
                            commandHistoryIndex: 0,
                            fieldHistory: [...state.fieldHistory, {text: userInput, isCommand: true}],
                            userInput: ''
                        }),
                        () => this.handleInputEvaluation(userInput));
                } else {
                    this.setState(state => ({
                        fieldHistory: [...state.fieldHistory, {isCommand: true}]
                    }));
                }
            } else {
                this.setState(state => ({
                    commandHistoryIndex: 0,
                    userInput: state.userInput += key
                }));
            }
        }
    }
    handleInputEvaluation(input) {
        try {
            const evaluatedForArithmetic = math.evaluate(input);
            if (!isNaN(evaluatedForArithmetic)) {
                return this.setState(state => ({fieldHistory: [...state.fieldHistory, {text: evaluatedForArithmetic}]}));
            }
            throw Error;
        } catch (err) {
            const {recognizedCommands, giveError, handleInputExecution} = this;
            const cleanedInput = input.toLowerCase().trim();
            const dividedInput = cleanedInput.split(' ');
            const parsedCmd = dividedInput[0];
            const parsedParams = dividedInput.slice(1).filter(s => s[0] !== '-');
            const parsedFlags = dividedInput.slice(1).filter(s => s[0] === '-');
            const isError = !recognizedCommands.some(s => s.command === parsedCmd);
            if (isError) {
                return this.setState(state => ({fieldHistory: [...state.fieldHistory, giveError('nr', input)]}));
            }
            return handleInputExecution(parsedCmd, parsedParams, parsedFlags);
        }
    }
    handleInputExecution(cmd, params = [], flags = []) {
        if (cmd === 'help') {
            if (params.length) {
                if (params.length > 1) {
                    return this.setState(state => ({
                        fieldHistory: [...state.fieldHistory, this.giveError('bp', {cmd: 'HELP', noAccepted: 1})]
                    }));
                }
                const cmdsWithHelp = this.recognizedCommands.filter(s => s.help);
                if (cmdsWithHelp.filter(s => s.command === params[0]).length) {
                    return this.setState(state => ({
                        fieldHistory: [...state.fieldHistory, {
                            text: cmdsWithHelp.filter(s => s.command === params[0])[0].help,
                            hasBuffer: true
                        }]
                    }));
                } else if (this.recognizedCommands.filter(s => s.command === params[0]).length) {
                    return this.setState(state => ({
                        fieldHistory: [...state.fieldHistory, {
                            text: [
                                `No additional help needed for ${this.recognizedCommands.filter(s => s.command === params[0])[0].command.toUpperCase()}`,
                                this.recognizedCommands.filter(s => s.command === params[0])[0].purpose],
                            hasBuffer: true
                        }]
                    }));
                }
                return this.setState(state => ({
                    fieldHistory: [...state.fieldHistory, this.giveError('up', params[0].toUpperCase())]
                }));
            }
            return this.setState(state => ({
                fieldHistory: [...state.fieldHistory, {
                    text: [
                        ...this.recognizedCommands.sort((a, b) => a.command.localeCompare(b.command)).map(({command, purpose}) => `${command.toUpperCase()}${Array.from({length: 15 - command.length}, x => '.').join('')}${purpose}`),
                        '',
                        'For help about a specific command, type HELP <CMD>, e.g. HELP PROJECT.'],
                    hasBuffer: true
                }]
            }));
        } else if (cmd === 'about') {
            return this.setState(state => ({
                fieldHistory: [...state.fieldHistory, {
                    text: [
                        'İsmi Tolga, 23 Yaşında Kariyerinin başlarındadır,',
						'Eğitim hayatının kaymağını 14 yıl bilgisayar veya ilgili bölümleri araştırarak yemiş,',
						'Menüsünde en az 9 yıllık Web Uygulama Geliştirme tecrübesi bulunduran,',
						'Ana yemek olarak PHP&Node.JS, ',
						'meze olarak HTML&CSS&JS&Unix sunabilen,',
						'Ara sıcak olarak büyük ve uzun süreli projelerde görev almış,',
						'Hamuru internet ve web uygulamaları ile yoğrulmuş,',
						'Ekip çalışmasında kuru-pilav uyumuna sahip,',
						'Tatlı olarak, araştırmayı seven, yaratıcı, analitik düşünme becerisi gelişmiş,',
						'Revani görünümünde bir birey.'
					],
                    hasBuffer: true
                }]
            }));
        } else if (cmd === 'experience') {
            return this.setState(state => ({
                fieldHistory: [...state.fieldHistory, {
                    text: [
                        ''
                    ],
                    hasBuffer: true
                }]
            }));
        } else if (cmd === 'skills') {
            return this.setState(state => ({
                fieldHistory: [...state.fieldHistory, {
                    text: [
                        '',
					],
                    hasBuffer: true
                }]
            }));
        } else if (cmd === 'projects') {
            return this.setState(state => ({
                fieldHistory: [...state.fieldHistory, {
                    text: [
                        'To view any of these projects live or their source files, type PROJECT <TITLE>',
                        '',
                        'VisualByFuture',
                        '',
                        'JetCompany',
                        '',
					],
                    hasBuffer: true
                }]
            }));
        } else if (cmd === 'project') {
            if (params.length === 1) {
                const projects = [
					{
						title: 'visualbyfuture',
						live: 'https://visualbyfuture.com'
					},
                    {
                        title: 'jetcompany',
                        live: 'http://jetcompany.co/'
                    }
				];
                return this.setState(state => ({fieldHistory: [...state.fieldHistory, {text: `Launching ${params[0]}...`, hasBuffer: true}]}), () => window.open(projects.filter(s => s.title === params[0])[0].live));
            }
            return this.setState(state => ({fieldHistory: [...state.fieldHistory, this.giveError('bp', {cmd: 'PROJECT', noAccepted: 1})]}));
        } else if (cmd === 'contacts') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {
					text: [
						'Email: me@tolqa.dev',
						'LinkedIn: @tolqa-er',
						'GitHub: @tolqadev',
						'Instagram: @tolqa.dev',
						'Twitter/X: @tolqadev'
					],
					hasBuffer: true
				}]
			}));
		} else if (cmd === 'contact') {
			if (params.length === 1) {
				const contact = [
					{
						title: 'email',
						live: 'mailto:me@tolqa.dev'
					},
					{
						title: 'linkedin',
						live: 'https://linkedin.com/in/tolqa-er/'
					},
					{
						title: 'github',
						live: 'https://github.com/TolqaDev'
					},
					{
						title: 'ınstagram',
						live: 'https://instagram.com/tolqa.dev'
					},
					{
						title: 'twitter',
						live: 'https://x.com/tolqadev'
					}
				];
				return this.setState(state => ({fieldHistory: [...state.fieldHistory, {text: `Launching ${params[0]}...`, hasBuffer: true}]}), () => window.open(contact.filter(s => s.title === params[0])[0].live));
			}
			return this.setState(state => ({fieldHistory: [...state.fieldHistory, this.giveError('bp', {cmd: 'CONTACT', noAccepted: 1})]}));
		} else if (cmd === 'clear') {
			return this.setState({fieldHistory: []});
		} else if (cmd === 'theme') {
			const {setTheme} = this.props;
			const validParams = params.length === 1 && ['d', 'dark', 'l', 'light'].some(s => s === params[0]);
			const validFlags = flags.length ? flags.length === 1 && (flags[0] === '-s' || flags[0] === '-save') ? true : false : true;
			if (validParams && validFlags) {
				const themeToSet = params[0] === 'd' || params[0] === 'dark' ? 'dark' : 'light';
				return this.setState(state => ({
						fieldHistory: [...state.fieldHistory, {
							text: `Set the theme to ${themeToSet.toUpperCase()} mode`,
							hasBuffer: true
						}]
					}),
					() => {
						if (flags.length === 1 && (flags[0] === '-s' || flags[0] === '-save')) {
							window.localStorage.setItem('reactTerminalThemePref', themeToSet);
						}
						setTheme(themeToSet);
					});
			}
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, this.giveError(!validParams ? 'bp' : 'bf', !validParams ? {
					cmd: 'THEME',
					noAccepted: 1
				} : 'THEME')]
			}));
		}
    }
    handleContextMenuPaste(e) {
        e.preventDefault();
        if ('clipboard' in navigator) {
            navigator.clipboard.readText().then(clipboard => this.setState(state => ({
                userInput: `${state.userInput}${clipboard}`
            })));
        }
    }
    giveError(type, extra) {
        const err = {text: '', isError: true, hasBuffer: true};
        if (type === 'nr') {
            err.text = `${extra} : The term or expression '${extra}' is not recognized. Check the spelling and try again. If you don't know what commands are recognized, type HELP.`;
        } else if (type === 'nf') {
            err.text = `The ${extra} command requires the use of flags. If you don't know what flags can be used, type HELP ${extra}.`;
        } else if (type === 'bf') {
            err.text = `The flags you provided for ${extra} are not valid. If you don't know what flags can be used, type HELP ${extra}.`;
        } else if (type === 'bp') {
            err.text = `The ${extra.cmd} command requires ${extra.noAccepted} parameter(s). If you don't know what parameter(s) to use, type HELP ${extra.cmd}.`;
        } else if (type === 'up') {
            err.text = `The command ${extra} is not supported by the HELP utility.`;
        }
        return err;
    }
    render() {
        const {theme} = this.props;
        const {fieldHistory, userInput} = this.state;
        return React.createElement("div", {
                id: "field",
                className: theme.app.backgroundColor === '#333444' ? 'dark' : 'light',
                style: theme.field,
                onKeyDown: e => this.handleTyping(e),
                tabIndex: 0,
                onContextMenu: e => this.handleContextMenuPaste(e)
            },
            fieldHistory.map(({text, isCommand, isError, hasBuffer}) => {
                if (Array.isArray(text)) {
                    return React.createElement(MultiText, {input: text, isError: isError, hasBuffer: hasBuffer});
                }
                return React.createElement(Text, {input: text,isCommand: isCommand,isError: isError,hasBuffer: hasBuffer});
            }),
		React.createElement(UserText, {input: userInput, theme: theme.cursor}));
    }
}
const Text = ({input, isCommand, isError, hasBuffer}) => React.createElement(React.Fragment, null, React.createElement("div", null, isCommand && React.createElement("div", {id: "query"}, "C:\\Users\\Guest>"), React.createElement("span", {className: !isCommand && isError ? 'error' : ''}, input)), hasBuffer && React.createElement("div", null));
const MultiText = ({input, isError, hasBuffer}) => React.createElement(React.Fragment, null, input.map(s => React.createElement(Text, {input: s, isError: isError})), hasBuffer && React.createElement("div", null));
const UserText = ({input, theme}) => React.createElement("div", null, React.createElement("div", {id: "query"}, "C:\\Users\\Guest>"), React.createElement("span", null, input), React.createElement("div", {id: "cursor", style: theme}));
ReactDOM.render(React.createElement(App, null), document.querySelector('#main'));