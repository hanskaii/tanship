import { cn } from "@workspace/ui/lib/cn";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	className?: string;
};

export function ContraIcon({ className }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 23 23"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M 12.157 10.679 L 22.425 10.679 C 22.589 10.679 22.671 10.679 22.671 10.514 L 22.671 10.186 C 22.671 10.104 22.671 10.021 22.507 10.021 C 17.661 8.707 13.882 5.011 12.65 0.164 L 12.321 0 L 12.075 0 C 11.993 0 11.911 0.082 11.911 0.246 L 11.911 10.514 C 11.911 10.596 11.911 10.679 12.075 10.679 Z M 12.157 22.671 L 12.486 22.671 L 12.65 22.507 C 13.964 17.661 17.661 13.882 22.507 12.65 L 22.671 12.404 L 22.671 12.157 C 22.671 12.075 22.589 11.911 22.425 11.911 L 12.157 11.911 L 11.993 12.157 L 11.993 22.425 C 11.993 22.589 11.993 22.671 12.157 22.671 Z M 10.268 22.671 L 10.514 22.671 C 10.596 22.671 10.679 22.589 10.679 22.425 L 10.679 12.157 C 10.679 12.075 10.679 11.911 10.514 11.911 L 0.246 11.911 C 0.082 11.911 0 12.075 0 12.157 L 0 12.486 C 0 12.568 0 12.65 0.164 12.65 C 5.011 13.882 8.789 17.661 10.021 22.507 Z M 0.246 10.679 L 10.514 10.679 C 10.596 10.679 10.679 10.679 10.679 10.514 L 10.679 0.246 C 10.679 0.082 10.679 0 10.514 0 L 10.186 0 C 10.104 0 10.021 0 10.021 0.164 C 8.707 4.929 4.929 8.789 0.164 10.021 L 0 10.268 L 0 10.514 C 0 10.596 0.082 10.679 0.246 10.679 Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function TanstackIcon({ className, ...props }: IconProps) {
	return (
		<svg
			className={cn("size-10", className)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 633 633"
			{...props}
		>
			<defs>
				<linearGradient
					id="tanstack__b"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="71.65%"
				>
					<stop offset="0%" stopColor="#6BDAFF" />
					<stop offset="31.922%" stopColor="#F9FFB5" />
					<stop offset="70.627%" stopColor="#FFA770" />
					<stop offset="100%" stopColor="#FF7373" />
				</linearGradient>
				<linearGradient
					id="tanstack__d"
					x1="43.996%"
					x2="53.441%"
					y1="8.54%"
					y2="93.872%"
				>
					<stop offset="0%" stopColor="#673800" />
					<stop offset="100%" stopColor="#B65E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__e"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#2F8A00" />
					<stop offset="100%" stopColor="#90FF57" />
				</linearGradient>
				<linearGradient
					id="tanstack__f"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#2F8A00" />
					<stop offset="100%" stopColor="#90FF57" />
				</linearGradient>
				<linearGradient
					id="tanstack__g"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#2F8A00" />
					<stop offset="100%" stopColor="#90FF57" />
				</linearGradient>
				<linearGradient
					id="tanstack__h"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#2F8A00" />
					<stop offset="100%" stopColor="#90FF57" />
				</linearGradient>
				<linearGradient
					id="tanstack__i"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#2F8A00" />
					<stop offset="100%" stopColor="#90FF57" />
				</linearGradient>
				<linearGradient
					id="tanstack__j"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#2F8A00" />
					<stop offset="100%" stopColor="#90FF57" />
				</linearGradient>
				<linearGradient
					id="tanstack__k"
					x1="92.9%"
					x2="8.641%"
					y1="45.768%"
					y2="54.892%"
				>
					<stop offset="0%" stopColor="#EE2700" />
					<stop offset="100%" stopColor="#FF008E" />
				</linearGradient>
				<linearGradient
					id="tanstack__l"
					x1="61.109%"
					x2="43.717%"
					y1="3.633%"
					y2="43.072%"
				>
					<stop offset="0%" stopColor="#FFF400" />
					<stop offset="100%" stopColor="#3C8700" />
				</linearGradient>
				<linearGradient
					id="tanstack__m"
					x1="50%"
					x2="50%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#FFDF00" />
					<stop offset="100%" stopColor="#FF9D00" />
				</linearGradient>
				<linearGradient
					id="tanstack__n"
					x1="127.279%"
					x2="0%"
					y1="49.778%"
					y2="50.222%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__o"
					x1="127.279%"
					x2="0%"
					y1="47.531%"
					y2="52.469%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__p"
					x1="127.279%"
					x2="0%"
					y1="46.195%"
					y2="53.805%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__q"
					x1="127.279%"
					x2="0%"
					y1="35.33%"
					y2="64.67%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__r"
					x1="127.279%"
					x2="0%"
					y1="4.875%"
					y2="95.125%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__s"
					x1="78.334%"
					x2="31.668%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__t"
					x1="57.913%"
					x2="44.88%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<linearGradient
					id="tanstack__u"
					x1="50.495%"
					x2="49.68%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#FFA400" />
					<stop offset="100%" stopColor="#FF5E00" />
				</linearGradient>
				<circle id="tanstack__a" cx="308.5" cy="308.5" r="308.5" />
				<circle id="tanstack__v" cx="307.5" cy="308.5" r="316.5" />
			</defs>

			<g fill="none" fillRule="evenodd" transform="translate(9 8)">
				<mask id="tanstack__c" fill="#fff">
					<use href="#tanstack__a" />
				</mask>
				<use href="#tanstack__a" fill="url(#tanstack__b)" />
				<ellipse
					cx="81.5"
					cy="602.5"
					fill="#015064"
					stroke="#00CFE2"
					strokeWidth="25"
					mask="url(#tanstack__c)"
					rx="214.5"
					ry="185.968"
				/>
				<ellipse
					cx="535.5"
					cy="602.5"
					fill="#015064"
					stroke="#00CFE2"
					strokeWidth="25"
					mask="url(#tanstack__c)"
					rx="214.5"
					ry="185.968"
				/>
				<ellipse
					cx="81.5"
					cy="640.5"
					fill="#015064"
					stroke="#00A8B8"
					strokeWidth="25"
					mask="url(#tanstack__c)"
					rx="214.5"
					ry="185.968"
				/>
				<ellipse
					cx="535.5"
					cy="640.5"
					fill="#015064"
					stroke="#00A8B8"
					strokeWidth="25"
					mask="url(#tanstack__c)"
					rx="214.5"
					ry="185.968"
				/>
				<ellipse
					cx="81.5"
					cy="676.5"
					fill="#015064"
					stroke="#007782"
					strokeWidth="25"
					mask="url(#tanstack__c)"
					rx="214.5"
					ry="185.968"
				/>
				<ellipse
					cx="535.5"
					cy="676.5"
					fill="#015064"
					stroke="#007782"
					strokeWidth="25"
					mask="url(#tanstack__c)"
					rx="214.5"
					ry="185.968"
				/>
				<g mask="url(#tanstack__c)">
					<path
						fill="url(#tanstack__d)"
						stroke="#6E3A00"
						strokeWidth="6.088"
						d="M98.318 88.007c7.691 37.104 16.643 72.442 26.856 106.013 10.212 33.571 25.57 68.934 46.07 106.088l-51.903 11.67c-10.057-60.01-17.232-99.172-21.525-117.487-4.293-18.315-10.989-51.434-20.089-99.357l20.591-6.927"
						transform="scale(-1 1) rotate(25 -300.37 -553.013)"
					/>
					<g stroke="#2F8A00">
						<path
							fill="url(#tanstack__e)"
							strokeWidth="9.343"
							d="M108.544 66.538s-13.54-21.305-37.417-27.785c-15.917-4.321-33.933.31-54.048 13.892C33.464 65.975 47.24 73.52 58.405 75.28c16.749 2.64 50.14-8.74 50.14-8.74Z"
							transform="rotate(1 -6061.691 5926.397)"
						/>
						<path
							fill="url(#tanstack__f)"
							strokeWidth="9.343"
							d="M108.544 67.138s-47.187-5.997-81.077 19.936C4.873 104.362-3.782 137.794 1.502 187.369c28.42-29.22 48.758-50.836 61.016-64.846 18.387-21.016 46.026-55.385 46.026-55.385Z"
							transform="rotate(1 -6061.691 5926.397)"
						/>
						<path
							fill="url(#tanstack__g)"
							strokeWidth="9.343"
							d="M108.544 66.538c-1.96-21.705 3.98-38.018 17.82-48.94C140.203 6.674 154.85.808 170.303 0c-4.865 21.527-12.373 36.314-22.524 44.361-10.151 8.048-23.23 15.44-39.236 22.177Z"
							transform="rotate(1 -6061.691 5926.397)"
						/>
						<path
							fill="url(#tanstack__h)"
							strokeWidth="9.343"
							d="M108.544 67.138c29.838-31.486 61.061-42.776 93.669-33.869C234.82 42.176 253.749 60.785 259 89.096c-34.898-3.657-59.974-6.343-75.228-8.058-15.254-1.716-40.33-6.349-75.228-13.9Z"
							transform="rotate(1 -6061.691 5926.397)"
						/>
						<path
							fill="url(#tanstack__i)"
							strokeWidth="9.343"
							d="M108.544 67.138c34.868-9.381 64.503-3.658 88.905 17.17 24.402 20.829 39.656 46.686 45.762 77.571-39.626-7.574-68.4-20.115-86.322-37.624a395.051 395.051 0 0 1-48.345-57.117Z"
							transform="rotate(1 -6061.691 5926.397)"
						/>
						<path
							fill="url(#tanstack__j)"
							strokeWidth="9.343"
							d="M108.544 67.138C76.206 82.6 57.608 105.366 52.75 135.436c-4.858 30.07-.292 62.89 13.698 98.462 24.873-41.418 38.905-71.368 42.096-89.849 3.191-18.48 3.191-44.118 0-76.91Z"
							transform="rotate(1 -6061.691 5926.397)"
						/>
						<path
							strokeLinecap="round"
							strokeWidth="5.91"
							d="M211.284 173.477c-13.851 21.992-23.291 42.022-28.32 60.093-5.03 18.071-8.175 33.143-9.436 45.216"
						/>
						<path
							strokeLinecap="round"
							strokeWidth="5.91"
							d="M209.814 176.884c-23.982 2.565-42.792 10.469-56.428 23.714-13.639 13.245-23.483 26.136-29.536 38.674M219.045 167.299c29.028-7.723 50.972-10.173 65.831-7.352 14.859 2.822 26.807 7.659 35.842 14.51M211.31 172.618c20.29 9.106 38.353 19.052 54.186 29.837 15.833 10.786 27.714 20.99 35.643 30.617"
						/>
					</g>
					<path
						stroke="#830305"
						strokeLinecap="round"
						strokeLinejoin="bevel"
						strokeWidth="6.937"
						d="m409.379 398.157-23.176 18.556M328.04 375.516l-22.313 28.398M312.904 353.698l53.18 59.816"
					/>
					<path
						fill="url(#tanstack__k)"
						d="M67.585 27.463H5.68C1.893 28.148 0 30.38 0 34.16c0 3.78 1.893 6.211 5.68 7.293h67.17l41.751-30.356c2.488-2.646 2.794-5.315.92-8.006s-4.6-3.626-8.177-2.803l-39.76 27.174Z"
						transform="scale(-1 1) rotate(-9 2092.128 2856.854)"
					/>
					<path
						fill="#D8D8D8"
						stroke="#FFF"
						strokeLinecap="round"
						strokeLinejoin="bevel"
						strokeWidth="4.414"
						d="m402.861 391.51.471-4.088M382.21 388.752l.472-4.087M361.546 385.404l.485-3.845M337.59 371.883l2.56-2.498M324.276 359.567l2.56-2.497"
					/>
				</g>
				<ellipse
					cx="308.5"
					cy="720.5"
					fill="url(#tanstack__l)"
					mask="url(#tanstack__c)"
					rx="266"
					ry="316.5"
				/>
				<ellipse
					cx="308.5"
					cy="720.5"
					stroke="#6DA300"
					strokeOpacity=".502"
					strokeWidth="26"
					mask="url(#tanstack__c)"
					rx="253"
					ry="303.5"
				/>
				<g mask="url(#tanstack__c)">
					<g transform="translate(389 -32)">
						<circle
							cx="168.5"
							cy="113.5"
							r="113.5"
							fill="url(#tanstack__m)"
						/>
						<circle
							cx="168.5"
							cy="113.5"
							r="106"
							stroke="#FFC900"
							strokeOpacity=".529"
							strokeWidth="15"
						/>
						<path
							stroke="url(#tanstack__n)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="M30 113H0"
						/>
						<path
							stroke="url(#tanstack__o)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="M33.5 79.5 7 74"
						/>
						<path
							stroke="url(#tanstack__p)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="m34 146-29 8"
						/>
						<path
							stroke="url(#tanstack__q)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="m45 177-24 13"
						/>
						<path
							stroke="url(#tanstack__r)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="m67 204-20 19"
						/>
						<path
							stroke="url(#tanstack__s)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="m94.373 227-13.834 22.847"
						/>
						<path
							stroke="url(#tanstack__t)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="M127.5 243.5 120 268"
						/>
						<path
							stroke="url(#tanstack__u)"
							strokeLinecap="round"
							strokeLinejoin="bevel"
							strokeWidth="12"
							d="m167.5 252.5.5 24.5"
						/>
					</g>
				</g>
				<circle
					cx="307.5"
					cy="308.5"
					r="304"
					stroke="#000"
					strokeWidth="25"
				/>
			</g>
		</svg>
	);
}

export function DodoPaymentIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="121"
			height="121"
			viewBox="0 0 121 121"
			fill="none"
			className={cn("size-6", className)}
			{...props}
		>
			<path
				d="M60.5 0.5C27.364 0.5 0.5 27.364 0.5 60.5C0.5 93.636 27.364 120.5 60.5 120.5C93.636 120.5 120.5 93.636 120.5 60.5C120.5 27.364 93.636 0.5 60.5 0.5Z"
				fill="#C6FE1E"
			/>
			<mask
				id="mask0_1_321"
				style={{ maskType: "luminance" }}
				maskUnits="userSpaceOnUse"
				x="18"
				y="27"
				width="91"
				height="76"
			>
				<path
					d="M108.5 27.5002H18.5V102.5H108.5V27.5002Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#mask0_1_321)">
				<path
					d="M53.3412 44.8038H53.3012C50.8212 44.0918 48.1972 45.5158 47.3572 47.8678C46.4292 50.3958 47.9012 53.2918 50.5012 54.0918C56.8692 55.8998 59.6052 46.7718 53.3412 44.8038Z"
					fill="#0D0D0D"
				/>
				<path
					d="M107.614 57.7079C99.4138 39.7479 73.2538 47.1799 70.8378 42.4759C63.7578 31.3639 50.5418 25.1239 36.2538 28.3399C34.0538 27.4599 26.4778 27.2199 21.5818 30.2999L24.5338 31.6039C24.7578 31.6999 24.6938 31.6759 25.0218 31.7959C26.3578 32.2999 26.1258 32.1559 25.1658 32.6839C22.9658 33.9719 20.2218 35.4679 18.5098 37.7159C18.5818 37.8199 22.2778 38.7079 22.2778 38.7079C22.3418 38.7239 23.0298 38.7959 22.8778 39.0999C10.7898 58.1879 31.1738 86.9959 41.0698 102.5H69.7178C65.2938 94.5799 60.2378 83.7719 61.9658 76.4359C62.2778 75.1079 62.6778 73.4199 64.3098 73.1959C68.2538 72.5639 73.5338 72.6199 77.2938 72.1959C77.2938 72.1959 77.3124 72.1959 77.3498 72.1959C78.1498 72.1559 97.7338 69.6679 102.422 81.8759C102.822 82.9959 103.742 82.2679 104.11 81.5319C107.606 74.5799 109.862 63.6359 107.63 57.7159L107.614 57.7079ZM75.9978 51.8119C74.6218 54.2679 73.6858 57.4599 73.4458 60.2439C73.3178 62.0119 73.5018 63.7559 73.6778 65.5239C73.7738 66.4999 73.7818 67.7319 72.9978 68.3719C72.3178 68.9479 71.1898 69.0039 70.0538 69.0839C64.4778 69.0599 50.8778 69.0839 45.6378 65.5159L45.6058 65.4919C37.9818 60.8439 33.9018 50.3479 38.4298 42.1959C39.8938 39.4279 42.5898 37.6279 45.6618 36.9479C49.6138 36.0439 53.9658 36.7159 57.4938 38.5639C58.9338 39.2919 60.6538 40.2519 61.9658 41.3559C64.5658 43.6279 66.7898 45.9879 70.1978 46.7159C71.7658 47.1639 73.3978 47.0999 74.9658 47.4199C77.9018 48.1239 77.1658 49.7959 75.9898 51.7959L75.9978 51.8119Z"
					fill="#0D0D0D"
				/>
			</g>
		</svg>
	);
}

export function HonoIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 76 98"
			className={cn("size-6", className)}
			{...props}
		>
			<path
				fill="url(#a)"
				d="m11 25 7 9s9-18 22-34c17 20 36 48 36 64 0 20-19 34-37 34C17 98 0 81 0 61c0-6 3-24 11-36Z"
			/>
			<path fill="#F95" d="M39 21c47 51 14 66 0 66-11 0-51-11 0-66Z" />
			<defs>
				<linearGradient id="a" x2="0%" y2="100%">
					<stop stopColor="#F84" />
					<stop offset="100%" stopColor="#F30" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function OXCIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="256px"
			height="157px"
			viewBox="0 0 256 157"
			preserveAspectRatio="xMidYMid"
			className={cn("size-6", className)}
			{...props}
		>
			<title>OXC</title>
			<path
				d="M 150.739 25.361 C 150.739 29.549 154.132 32.944 158.321 32.944 L 187.085 32.944 C 190.464 32.944 192.154 37.029 189.765 39.411 L 152.954 76.222 C 151.533 77.643 150.733 79.571 150.733 81.586 L 150.733 94.172 C 150.733 99.405 155.924 103.038 160.516 100.539 C 165.195 97.997 169.547 94.921 173.483 91.398 C 175.041 90.005 177.44 89.99 178.92 91.476 L 205.729 118.287 C 207.208 119.767 207.217 122.169 205.684 123.6 C 185.353 142.626 158.024 154.279 127.98 154.279 C 97.937 154.279 70.609 142.626 50.278 123.6 C 48.745 122.169 48.752 119.767 50.233 118.287 L 77.042 91.476 C 78.522 89.997 80.921 90.005 82.479 91.398 C 86.414 94.921 90.769 97.997 95.446 100.539 C 100.047 103.038 105.231 99.405 105.231 94.172 L 105.231 81.586 C 105.231 79.571 104.429 77.643 103.006 76.222 L 66.197 39.411 C 63.806 37.022 65.498 32.944 68.877 32.944 L 97.641 32.944 C 101.83 32.944 105.224 29.549 105.224 25.361 L 105.224 6.402 C 105.224 4.308 106.919 2.61 109.014 2.61 L 146.926 2.61 C 149.023 2.61 150.716 4.308 150.716 6.402 L 150.716 25.361 L 150.739 25.361 Z"
				fill="#32F3EF"
				style={{ strokeWidth: 10.455 }}
			/>
			<g
				mask="url(#mask0_242_21098)"
				transform="matrix(10.454983, 0, 0, 10.454983, -597.867554, 0.031955)"
			>
				<g filter="url(#filter0_f_242_21098)">
					<ellipse
						cx="1.48042"
						cy="6.89295"
						rx="1.48042"
						ry="6.89295"
						transform="matrix(0 -1 -1 0 76.2773 16.4662)"
						fill="#AEFFFB"
					/>
				</g>
				<g filter="url(#filter1_f_242_21098)">
					<ellipse
						cx="1.48042"
						cy="6.89295"
						rx="1.48042"
						ry="6.89295"
						transform="matrix(-0.369097 -0.929391 -0.929391 0.369097 82.167 13.1878)"
						fill="#00FF88"
					/>
				</g>
				<g filter="url(#filter2_f_242_21098)">
					<ellipse
						cx="63.5513"
						cy="14.356"
						rx="1.48042"
						ry="6.89295"
						transform="rotate(-68.3401 63.5513 14.356)"
						fill="#195EFF"
					/>
				</g>
				<g filter="url(#filter3_f_242_21098)">
					<ellipse
						cx="72.1198"
						cy="9.50884"
						rx="1.19104"
						ry="2.00952"
						transform="rotate(-135.197 72.1198 9.50884)"
						fill="#AEFFFB"
					/>
				</g>
				<g filter="url(#filter4_f_242_21098)">
					<ellipse
						cx="72.7331"
						cy="8.40392"
						rx="1.19104"
						ry="2.00952"
						transform="rotate(-135.197 72.7331 8.40392)"
						fill="#195EFF"
					/>
				</g>
				<g filter="url(#filter5_f_242_21098)">
					<ellipse
						cx="72.61"
						cy="2.26516"
						rx="1.19104"
						ry="2.00952"
						transform="rotate(-135.197 72.61 2.26516)"
						fill="#AEFFFB"
					/>
				</g>
				<g filter="url(#filter6_f_242_21098)">
					<ellipse
						cx="72.9792"
						cy="1.77413"
						rx="1.19104"
						ry="2.00952"
						transform="rotate(-135.197 72.9792 1.77413)"
						fill="#195EFF"
					/>
				</g>
				<g filter="url(#filter7_f_242_21098)">
					<ellipse
						cx="1.19104"
						cy="2.00952"
						rx="1.19104"
						ry="2.00952"
						transform="matrix(0.709532 -0.704673 -0.704673 -0.709532 67.4111 12.0195)"
						fill="#AEFFFB"
					/>
				</g>
				<g filter="url(#filter8_f_242_21098)">
					<ellipse
						cx="1.19104"
						cy="2.00952"
						rx="1.19104"
						ry="2.00952"
						transform="matrix(0.709532 -0.704673 -0.704673 -0.709532 66.5518 10.9146)"
						fill="#195EFF"
					/>
				</g>
				<g filter="url(#filter9_f_242_21098)">
					<ellipse
						cx="1.19104"
						cy="2.00952"
						rx="1.19104"
						ry="2.00952"
						transform="matrix(0.709532 -0.704673 -0.704673 -0.709532 66.5518 4.53027)"
						fill="#AEFFFB"
					/>
				</g>
				<g filter="url(#filter10_f_242_21098)">
					<ellipse
						cx="1.19104"
						cy="2.00952"
						rx="1.19104"
						ry="2.00952"
						transform="matrix(0.709532 -0.704673 -0.704673 -0.709532 66.4287 3.7937)"
						fill="#195EFF"
					/>
				</g>
				<g filter="url(#filter11_f_242_21098)">
					<ellipse
						cx="1.19104"
						cy="3.83074"
						rx="1.19104"
						ry="3.83074"
						transform="matrix(0.709532 -0.704673 -0.704673 -0.709532 66.6748 9.44125)"
						fill="#195EFF"
					/>
				</g>
				<g filter="url(#filter12_f_242_21098)">
					<ellipse
						cx="74.3846"
						cy="4.90172"
						rx="1.19104"
						ry="3.83074"
						transform="rotate(-135.197 74.3846 4.90172)"
						fill="#00FF88"
					/>
				</g>
				<g filter="url(#filter13_f_242_21098)">
					<ellipse
						cx="1.48042"
						cy="6.89295"
						rx="1.48042"
						ry="6.89295"
						transform="matrix(0 -1 -1 0 76.2773 17.0801)"
						fill="#195EFF"
					/>
				</g>
			</g>
			<g transform="matrix(1.668066, 0, 0, 1.668066, 0.226336, 0.004702)">
				<path
					d="M 13.881 0.017 C -4.602 26.473 -4.711 67.482 13.881 94.032 L 26.368 94.032 C 7.782 67.482 7.89 26.473 26.368 0.017 L 13.881 0.017 Z"
					fill="#08060D"
					style={{ strokeWidth: 6.268 }}
				/>
				<path
					d="M 139.307 0.017 L 126.82 0.017 C 145.302 26.473 145.411 67.482 126.82 94.032 L 139.307 94.032 C 157.895 67.482 157.786 26.473 139.307 0.017 Z"
					fill="#08060D"
					style={{ strokeWidth: 6.268 }}
				/>
			</g>
			<mask
				id="mask0_242_21098"
				style={{ maskType: "alpha" }}
				maskUnits="userSpaceOnUse"
				x="61"
				y="0"
				width="16"
				height="15"
			>
				<path
					d="M71.6029 2.42249C71.6029 2.82304 71.9275 3.14762 72.328 3.14762H75.0794C75.4026 3.14762 75.5642 3.53851 75.3356 3.7664L71.8149 7.2871C71.6789 7.42315 71.6022 7.60754 71.6022 7.80022V9.00394C71.6022 9.50463 72.0988 9.852 72.538 9.61305C72.9855 9.36996 73.4019 9.07576 73.7783 8.73875C73.9275 8.60546 74.1568 8.60408 74.2983 8.74634L76.8625 11.3106C77.0041 11.4521 77.0048 11.6821 76.8584 11.8188C74.9137 13.6386 72.2997 14.7532 69.4261 14.7532C66.5525 14.7532 63.9386 13.6386 61.9939 11.8188C61.8474 11.6821 61.8481 11.4521 61.9897 11.3106L64.5539 8.74634C64.6955 8.60477 64.9248 8.60546 65.074 8.73875C65.4503 9.07576 65.8668 9.36996 66.3143 9.61305C66.7542 9.852 67.25 9.50463 67.25 9.00394V7.80022C67.25 7.60754 67.1734 7.42315 67.0373 7.2871L63.5166 3.7664C63.288 3.53781 63.4497 3.14762 63.7729 3.14762H66.5242C66.9248 3.14762 67.2494 2.82304 67.2494 2.42249V0.608966C67.2494 0.408691 67.4116 0.246399 67.6119 0.246399H71.2383C71.4386 0.246399 71.6008 0.408691 71.6008 0.608966V2.42249H71.6029Z"
					fill="#D9D9D9"
				/>
			</mask>
			<defs>
				<filter
					id="filter0_f_242_21098"
					x="59.5446"
					y="10.5588"
					width="19.6793"
					height="8.85399"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter1_f_242_21098"
					x="65.8376"
					y="8.51653"
					width="18.7535"
					height="11.679"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter2_f_242_21098"
					x="54.1745"
					y="8.51653"
					width="18.7535"
					height="11.679"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter3_f_242_21098"
					x="67.5241"
					y="4.90749"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter4_f_242_21098"
					x="68.1374"
					y="3.80257"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter5_f_242_21098"
					x="68.0144"
					y="-2.33619"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter6_f_242_21098"
					x="68.3835"
					y="-2.82722"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter7_f_242_21098"
					x="62.2439"
					y="5.15304"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter8_f_242_21098"
					x="61.3845"
					y="4.04815"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter9_f_242_21098"
					x="61.3845"
					y="-2.33619"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter10_f_242_21098"
					x="61.2614"
					y="-3.07276"
					width="9.19198"
					height="9.20269"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter11_f_242_21098"
					x="59.0446"
					y="0.091939"
					width="11.5514"
					height="11.584"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter12_f_242_21098"
					x="68.6091"
					y="-0.890269"
					width="11.5514"
					height="11.584"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
				<filter
					id="filter13_f_242_21098"
					x="59.5446"
					y="11.1727"
					width="19.6793"
					height="8.85399"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						stdDeviation="1.47329"
						result="effect1_foregroundBlur_242_21098"
					/>
				</filter>
			</defs>
		</svg>
	);
}

export function DrizzleIcon({ className, ...props }: IconProps) {
	return (
		<svg
			fill="none"
			viewBox="0 0 160 160"
			className={cn("size-10", className)}
			{...props}
		>
			<rect
				width="9.631"
				height="40.852"
				fill="#C5F74F"
				rx="4.816"
				transform="matrix(.87303 .48767 -.49721 .86763 43.48 67.304)"
			/>
			<rect
				width="9.631"
				height="40.852"
				fill="#C5F74F"
				rx="4.816"
				transform="matrix(.87303 .48767 -.49721 .86763 76.94 46.534)"
			/>
			<rect
				width="9.631"
				height="40.852"
				fill="#C5F74F"
				rx="4.816"
				transform="matrix(.87303 .48767 -.49721 .86763 128.424 46.535)"
			/>
			<rect
				width="9.631"
				height="40.852"
				fill="#C5F74F"
				rx="4.816"
				transform="matrix(.87303 .48767 -.49721 .86763 94.957 67.304)"
			/>
		</svg>
	);
}

export function ShadcnIcon({ className, ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 256 256"
			className={cn("size-6", className)}
			{...props}
		>
			<path fill="none" d="M0 0h256v256H0z" />
			<path
				fill="none"
				stroke="currentColor"
				strokeWidth="25"
				strokeLinecap="round"
				d="M208 128l-80 80M192 40L40 192"
			/>
		</svg>
	);
}

export function TailwindIcon({ className, ...props }: IconProps) {
	return (
		<svg
			fill="none"
			viewBox="0 0 54 33"
			className={cn("size-6", className)}
			{...props}
		>
			<path
				fill="#38bdf8"
				fillRule="evenodd"
				d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

export function BetterAuthIcon({ className, ...props }: IconProps) {
	return (
		<svg
			fill="none"
			viewBox="0 0 500 500"
			className={cn("size-6", className)}
			{...props}
		>
			<path fill="#fff" d="M0 0h500v500H0z" />
			<path
				fill="#000"
				d="M69 121h86.988v259H69zM337.575 121H430v259h-92.425z"
			/>
			<path
				fill="#000"
				d="M427.282 121v83.456h-174.52V121zM430 296.544V380H252.762v-83.456z"
			/>
			<path fill="#000" d="M252.762 204.455v92.089h-96.774v-92.089z" />
		</svg>
	);
}

export function CloudflareIcon({ className, ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 256 231"
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			preserveAspectRatio="xMidYMid"
			className={cn("size-8", className)}
			{...props}
		>
			<defs>
				<linearGradient
					id="cloudflare_workers__a"
					x1="50%"
					x2="25.7%"
					y1="100%"
					y2="8.7%"
				>
					<stop offset="0%" stopColor="#EB6F07"></stop>
					<stop offset="100%" stopColor="#FAB743"></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__b"
					x1="81%"
					x2="40.5%"
					y1="83.7%"
					y2="29.5%"
				>
					<stop offset="0%" stopColor="#D96504"></stop>
					<stop
						offset="100%"
						stopColor="#D96504"
						stopOpacity="0"
					></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__c"
					x1="42%"
					x2="84%"
					y1="8.7%"
					y2="79.9%"
				>
					<stop offset="0%" stopColor="#EB6F07"></stop>
					<stop
						offset="100%"
						stopColor="#EB720A"
						stopOpacity="0"
					></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__d"
					x1="50%"
					x2="25.7%"
					y1="100%"
					y2="8.7%"
				>
					<stop offset="0%" stopColor="#EE6F05"></stop>
					<stop offset="100%" stopColor="#FAB743"></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__e"
					x1="-33.2%"
					x2="91.7%"
					y1="100%"
					y2="0%"
				>
					<stop
						offset="0%"
						stopColor="#D96504"
						stopOpacity="0.8"
					></stop>
					<stop
						offset="49.8%"
						stopColor="#D96504"
						stopOpacity="0.2"
					></stop>
					<stop
						offset="100%"
						stopColor="#D96504"
						stopOpacity="0"
					></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__f"
					x1="50%"
					x2="25.7%"
					y1="100%"
					y2="8.7%"
				>
					<stop offset="0%" stopColor="#FFA95F"></stop>
					<stop offset="100%" stopColor="#FFEBC8"></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__g"
					x1="8.1%"
					x2="96.5%"
					y1="1.1%"
					y2="48.8%"
				>
					<stop offset="0%" stopColor="#FFF" stopOpacity="0.5"></stop>
					<stop
						offset="100%"
						stopColor="#FFF"
						stopOpacity="0.1"
					></stop>
				</linearGradient>
				<linearGradient
					id="cloudflare_workers__h"
					x1="-13.7%"
					x2="100%"
					y1="104.2%"
					y2="46.2%"
				>
					<stop offset="0%" stopColor="#FFF" stopOpacity="0.5"></stop>
					<stop
						offset="100%"
						stopColor="#FFF"
						stopOpacity="0.1"
					></stop>
				</linearGradient>
			</defs>
			<path
				fill="url(#cloudflare_workers__a)"
				d="m65.82 3.324 30.161 54.411-27.698 49.857a16.003 16.003 0 0 0 0 15.573l27.698 49.98-30.16 54.411a32.007 32.007 0 0 1-13.542-12.74L4.27 131.412a32.13 32.13 0 0 1 0-32.007l48.01-83.403a32.007 32.007 0 0 1 13.542-12.68Z"
			></path>
			<path
				fill="url(#cloudflare_workers__b)"
				d="M68.283 107.654a16.003 16.003 0 0 0 0 15.51l27.698 49.98-30.16 54.412a32.007 32.007 0 0 1-13.542-12.74L4.27 131.412c-3.816-6.586 17.542-14.465 64.014-23.698v-.061Z"
				opacity="0.7"
			></path>
			<path
				fill="url(#cloudflare_workers__c)"
				d="m68.898 8.802 27.083 48.933-4.493 7.818-23.882-40.44c-6.894-11.264-17.42-5.416-30.591 17.358l1.97-3.386 13.294-23.082a32.007 32.007 0 0 1 13.419-12.68l3.139 5.479h.061Z"
				opacity="0.5"
			></path>
			<path
				fill="url(#cloudflare_workers__d)"
				d="m203.696 16.003 48.01 83.403c5.725 9.848 5.725 22.159 0 32.007l-48.01 83.402a32.007 32.007 0 0 1-27.698 16.004h-48.01l59.705-107.654a16.003 16.003 0 0 0 0-15.511L127.988 0h48.01a32.007 32.007 0 0 1 27.698 16.003Z"
			></path>
			<path
				fill="url(#cloudflare_workers__e)"
				d="m173.536 230.45-47.395.43 57.367-108.208a16.619 16.619 0 0 0 0-15.634L126.14 0h10.834l60.197 106.546a16.619 16.619 0 0 1-.062 16.496 9616.838 9616.838 0 0 0-38.592 67.707c-11.695 20.558-6.648 33.791 15.018 39.7Z"
			></path>
			<path
				fill="url(#cloudflare_workers__f)"
				d="M79.978 230.819c-4.924 0-9.849-1.17-14.157-3.263l59.212-106.792a11.045 11.045 0 0 0 0-10.71L65.821 3.324A32.007 32.007 0 0 1 79.978 0h48.01l59.705 107.654a16.003 16.003 0 0 1 0 15.51L127.988 230.82h-48.01Z"
			></path>
			<path
				fill="url(#cloudflare_workers__g)"
				d="M183.508 110.054 122.448 0h5.54l59.705 107.654a16.003 16.003 0 0 1 0 15.51L127.988 230.82h-5.54l61.06-110.055a11.045 11.045 0 0 0 0-10.71Z"
				opacity="0.6"
			></path>
			<path
				fill="url(#cloudflare_workers__h)"
				d="M125.033 110.054 65.821 3.324c1.846-.985 4.062-1.724 6.155-2.34 13.049 23.452 32.315 59.029 57.859 106.67a16.003 16.003 0 0 1 0 15.51L71.053 229.589c-2.093-.616-3.201-1.047-5.17-1.97l59.089-106.792a11.045 11.045 0 0 0 0-10.71l.061-.062Z"
				opacity="0.6"
			></path>
		</svg>
	);
}
