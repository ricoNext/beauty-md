"use client";

import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getDefaultMarkdownExtensions } from "@/lib/codemirror-setup";

export interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder: _placeholder,
	className,
}: MarkdownEditorProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const initialValueRef = useRef(value);
	initialValueRef.current = value;
	// 仅当 value 来自外部（非本次编辑的 onChange 回传）时才同步到编辑器，避免竞态导致 Position out of range
	const lastSentValueRef = useRef(value);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const state = EditorState.create({
			doc: initialValueRef.current,
			extensions: [
				...getDefaultMarkdownExtensions(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const doc = update.state.doc.toString();
						lastSentValueRef.current = doc;
						onChangeRef.current(doc);
					}
				}),
			],
		});

		const view = new EditorView({
			state,
			parent: container,
		});
		viewRef.current = view;
		lastSentValueRef.current = initialValueRef.current;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	// 仅当 value 与「我们上次通过 onChange 发出的内容」不同时，视为外部变更并同步
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		if (value === lastSentValueRef.current) return;
		const current = view.state.doc.toString();
		if (value === current) return;
		lastSentValueRef.current = value;
		view.dispatch({
			changes: { from: 0, to: current.length, insert: value },
		});
	}, [value]);

	return (
		<div
			ref={containerRef}
			className={cn("cm-editor-wrapper min-h-full overflow-auto", className)}
		/>
	);
}
