import { access } from 'fs';
const fsExists = (pathLike: string) =>
	new Promise<boolean>((resolve, reject) => {
		access(pathLike, err => {
			err ? resolve(false) : resolve(true);
		});
	});
export default fsExists;
