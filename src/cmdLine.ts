import { Command, Option } from 'commander';
import { Action } from './action';

export const registerCommands = async (actions: Action[]): Promise<void> => {
  const program = new Command();

  actions.forEach((action) => {
    // add command
    let command = program
      .command(action.name, {isDefault: action.isDefault})
      .description(action.description);
    // process arguments
    command = action.arguments.reduce(
      (cmd, {name, description, parser}) => cmd.argument(name, description, parser),
      command,
    );
    // process options
    command = action.options.reduce(
      (cmd, {name, description, parser, defaultValue}) => {
        let option = new Option(name, description);
        if (parser) {
          option = option.argParser(parser);
        }
        if (defaultValue) {
          option = option.default(defaultValue);
        }
        return cmd.addOption(option);
      },
      command,
    );
    // bind action
    command.action(action.do.bind(action));
  });

  await program.parseAsync();
};
