x = input('Enter anything: ')
x = x.lstrip()
x = x.rstrip()
if x.isalpha(): print('alpha')
elif x.count('.') > 1 or x.count(' ')>0: print("illegal")
elif x.isdigit() and len(x.split('.')) == 2: print('float')
elif x.isdigit() and x.count('.') == 0: print('int')
else: print('mix')